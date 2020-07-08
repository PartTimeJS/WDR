module.exports = async (WDR, Message) => {

  // DEFINE VARIABLES
  Message.prefix = WDR.Config.PREFIX;

  if (!Message.content.startsWith(Message.prefix)) {
    return;
  }

  // CHECK IF THE MESSAGE IS FROM A BOT
  if (Message.author.bot == true) {
    return;
  }

  Message.member.isAdmin = Message.member.hasPermission("ADMINISTRATOR") ? true : false;

  Message.member.isMod = Message.member.hasPermission("MANAGE_ROLES") ? true : false;


  WDR.Discords.forEach(async (Server, index) => {

    if (Message.channel.type == "dm") {

      // GET GUILD
      let guild = WDR.Bot.guilds.cache.get(Server.id);
      if (!guild) {
        return;
      }
      // if(guild){

      // GET MEMBER
      Message.member = WDR.Bot.guilds.cache.get(Server.id).members.cache.get(Message.author.id);
      if (!member) {
        return;
      }
      // if(member){



      // FETCH THE GUILD MEMBER AND CHECK IF A DONOR
      if (Message.member.isAdmin) {
        /* DO NOTHING */
      } else if (Server.donor_role && !Message.member.roles.cache.has(Server.donor_role)) {
        let donor_info = "";
        if (WDR.Config.log_channel) {
          let nondonor_embed = new WDR.DiscordJS.MessageEmbed()
            .setColor("ff0000")
            .addField("User attempted to use DM command, not a donor.", Message.member.user.username);
          if (WDR.Config.donor_info) {
            donor_info = WDR.Config.donor_info
          }
          WDR.Send_Embed(WDR, "member", 0, Server.id, "", nondonor_embed, WDR.Config.log_channel);
        } else {
          console.log(WDR.Color.red + "User attempted to use DM command, not a donor. " + Message.member.user.username + WDR.Color.reset);
        }
        return Message.reply("This feature is only for donors. " + donor_info);
      }

      WDR.wdrDB.query("SELECT * FROM users WHERE user_id = ?", [Message.author.id, Server.id], async function(error, user, fields) {
        // CHECK IF THE USER HAS AN EXISTING RECORD IN THE USER TABLE
        if (!user || !user[0]) {
          return Message.reply("Before you can create and modify subscriptions via DM, you must first use the subsciption channel in your scanner discord.");
        } else if (user[0].discord_id != Server.id) {
          // DON"T KEEP CYCLING THROUGH SERVERS. I"M LAZY
          // THIS IS WHERE WE COULD ASK "WHAT SERVER DO YOU WANT TO MODIFY SUBS FOR?"
          return;
        } else {

          let command = Message.content.split(" ")[0].slice(1);
          let Cmd = WDR.Commands.get(command.toLowerCase());
          if (Cmd) {
            return Cmd(WDR, Message, server, user[0]);
          }
        }
      });
    } else if (Server.id === Message.guild.id && Server.command_channels.indexOf(Message.channel.id) >= 0) {

      Message.Discord = Server;

      // DELETE THE MESSAGE
      if (WDR.Config.Tidy_Channel == "ENABLED") {
        Message.delete();
      }

      // FETCH THE GUILD MEMBER AND CHECK IF A DONOR
      if (Message.member.isAdmin || Message.member.isMod) {
        /* DO NOTHING */
      } else if (Server.donor_role && !Message.member.roles.cache.has(Server.donor_role)) {
        if (WDR.Config.log_channel) {
          let nondonor_embed = new WDR.DiscordJS.MessageEmbed()
            .setColor("ff0000")
            .addField("User attempted to use a subsciption command, not a donor. ", Message.member.user.username);
          if (WDR.Config.donor_info) {
            Message.donor_info = WDR.Config.donor_info;
          } else {
            Message.donor_info = "";
          }
          Message.guild.members.fetch(Message.author.id).then(TARGET => {
            TARGET.send("This feature is only for donors. " + Message.donor_info).catch(console.error);
          });
          return WDR.Send_Embed(WDR, "member", 0, Server.id, "", nondonor_embed, WDR.Config.log_channel);
        } else {
          return console.log(WDR.Color.red + "User attempted to use DM command, not a donor. " + Message.member.user.username + WDR.Color.reset);
        }
      }

      // LOAD DATABASE RECORD BASED OFF OF ORIGIN SERVER_ID AND AUTHOR_ID
      WDR.wdrDB.query(
        "SELECT * FROM wdr_users WHERE user_id = ? AND guild_id = ?",
        [Message.author.id, Message.guild.id],
        async function(error, user, fields) {

          // CHECK IF THE USER HAS AN EXISTING RECORD IN THE USER TABLE
          if (!user || !user[0]) {
            Message.member.db = await WDR.Save_User(WDR, Message, Server);
          } else {
            Message.member.db = user[0];
          }

          let command = Message.content.split(" ")[0].slice(1);
          switch (command) {
            case "p":
              command = "pokemon";
              break;
            case "r":
              command = "raid";
              break;
            case "q":
              command = "quest";
              break;
          }

          let Cmd = WDR.Commands.Subscription.get(command.toLowerCase());
          if (Cmd) {
            return Cmd(WDR, Message);
          }
        }
      );
    }

    // GLOBAL COMMANDS
    if (WDR.Config.Admin_Enabled == "YES" && Message.member.isAdmin) {

      let command = Message.content.split(" ")[0].slice(1);
      let Cmd = WDR.Commands.Admin.get(command.toLowerCase());
      if (Cmd) {
        return Cmd(WDR, Message);
      }
    }
  });

  // END
  return;
}