module.exports = async (WDR, Message) => {

  // DEFINE VARIABLES
  Message.prefix = WDR.Config.PREFIX;

  if (!Message.content.startsWith(Message.prefix)) {
    return;
  }

  if (Message.author.bot == true) {
    return;
  }

  console.log(Message.channel.type);
  if (Message.channel.type == "dm") {

    Message.author.user_guilds = [];

    WDR.Discords.forEach(async (Server, index) => {
      let guild = WDR.Bot.guilds.cache.get(Server.id);
      if (!guild) {
        WDR.Console.error(WDR, "[handlers/commands.js] Guild ID `" + Server.id + "` found in the database that does not match any guilds in the config.");
      } else {
        let member = WDR.Bot.guilds.cache.get(Server.id).members.cache.get(Message.author.id);
        if (member && member.roles.cache.has(Server.donor_role)) {
          Message.author.user_guilds.push({
            id: guild.id,
            name: Server.name
          });
        }
      }
    });

    if (Message.author.user_guilds.length == 1) {
      WDR.wdrDB.query(
        `SELECT
            *
         FROM
            users
         WHERE
            user_id = ${Message.author.id}
            AND guild_id = ${user_guilds[0]}`,
        async function(error, user, fields) {
          if (!user || !user[0]) {
            return Message.reply("Before you can create and modify subscriptions via DM, you must first use the subsciption channel in your scanner discord.");
          } else {
            Message.author.db = user[0];
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

          let Cmd = require(WDR.Dir + "/src/commands/subscription/" + command.toLowerCase() + "/begin.js")
          if (Cmd) {
            Cmd(WDR, Message);
          }
        }
      );
    } else if (Message.author.user_guilds.length > 1) {

      let list = "";
      Message.author.user_guilds.forEach((guild, i) => {
        list += (i + 1) + " - " + guild.name + "\n";
      });
      list = list.slice(0, -1);

      let request_action = new WDR.DiscordJS.MessageEmbed()
        .setAuthor(Message.author.username, Message.author.displayAvatarURL())
        .setTitle("Which Discord would you like to modify Subscriptions for?")
        .setDescription(list)
        .setFooter("Type the number of the discord.");

      Message.channel.send(request_action).catch(console.error).then(BotMsg => {

        const filter = CollectedMsg => CollectedMsg.author.id == Message.author.id;
        const collector = Message.channel.createMessageCollector(filter, {
          time: 60000
        });

        collector.on("collect", CollectedMsg => {

          let num = parseInt(CollectedMsg.content);

          switch (true) {
            case (isNaN(CollectedMsg.content)):
              return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a Number. Type the number next to the Discord name above.").then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            case (num > 0 && num <= list.length):
              return collector.stop((num - 1));
            default:
              return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a valid # selection. Type the number next to the Discord name above.").then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
          }
        });

        collector.on("end", (collected, num) => {

          console.log(Message.author.user_guilds);
          console.log("num", Message.author.user_guilds[num])

          BotMsg.delete();
          let query = `
            SELECT
                *
            FROM
                wdr_users
            WHERE
                user_id = ${Message.author.id}
                AND guild_id = ${Message.author.user_guilds[num].id};
          `;
          console.log(query);
          WDR.wdrDB.query(
            query,
            async function(error, user, fields) {
              if (error) {
                WDR.Console.error(WDR, "[src/handlers/commands.js] DM: Error Fetching User From DB", [query, error])
              }
              Message.author.db = user[0];

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

              let Cmd = require(WDR.Dir + "/src/commands/subscription/" + command.toLowerCase() + "/begin.js")
              if (Cmd) {
                Cmd(WDR, Message);
              }
            }
          );
        });
      });
    } else {
      return Message.reply("I did not find any Discords in which you are a Donor. Please go to your discord's subscribe website before modifying subscriptions");
    }
  } else {

    if (!Message.member) {
      return;
    }

    Message.member.isAdmin = Message.member.hasPermission("ADMINISTRATOR") ? true : false;

    Message.member.isMod = Message.member.hasPermission("MANAGE_ROLES") ? true : false;

    WDR.Discords.forEach(async (Server, index) => {

      if (Message.guild.id == Server.id && Server.command_channels.indexOf(Message.channel.id) >= 0) {

        Message.Discord = Server;

        // DELETE THE MESSAGE
        //if (!WDR.Config.Tidy_Channel || WDR.Config.Tidy_Channel == "ENABLED") {
        Message.delete();
        //}

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
          `SELECT
                *
             FROM
                wdr_users
             WHERE
                user_id = ${Message.member.id}
                AND guild_id = ${Message.guild.id};`,
          async function(error, user, fields) {
            if (!user || !user[0]) {
              Message.member.db = await WDR.Save_User(WDR, Message, Server);
              Message.reply("Created database record for you. Please repeat the previous command.").then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            } else {
              Message.member.db = user[0];

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
              try {
                let Cmd = require(WDR.Dir + "/src/commands/subscription/" + command.toLowerCase() + "/begin.js");
                if (Cmd) {
                  Cmd(WDR, Message);
                }
              } catch (error) {
                let Cmd = require(WDR.Dir + "/src/commands/subscription/" + command.toLowerCase() + ".js");
                if (Cmd) {
                  Cmd(WDR, Message);
                } else {
                  WDR.Console.error("[handlers/commands.js] Error Initializing Command", [command, error])
                }
              }

              WDR.wdrDB.query(`UPDATE wdr_users SET user_name = '${Message.member.user.username}' WHERE user_id = ${Message.member.id};`);
              WDR.wdrDB.query(`UPDATE wdr_subscriptions SET user_name = '${Message.member.user.username}' WHERE user_id = ${Message.member.id};`);
            }
            return;
          }
        );
      }
    });
  }

  // GLOBAL COMMANDS
  if (Message.member && WDR.Config.Admin_Enabled == "YES" && Message.member.isAdmin) {
    let command = Message.content.split(" ")[0].slice(1);
    let Cmd = WDR.Commands.Admin.get(command.toLowerCase());
    if (Cmd) {
      Cmd(WDR, Message);
    }
  }

  // END
  return;
}