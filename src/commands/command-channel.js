module.exports = (WDR, Message) => {

  if (!Message.member) {
    return;
  }

  Message.member.isAdmin = Message.member.hasPermission("ADMINISTRATOR") ? true : false;

  Message.member.isMod = Message.member.hasPermission("MANAGE_ROLES") ? true : false;

  WDR.Discords.forEach(async (Server, index) => {

    if (Message.guild.id == Server.id && Server.command_channels.indexOf(Message.channel.id) >= 0) {

      Message.discord = Server;

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
      WDR.wdrDB.query(`
          SELECT
              *
          FROM
              wdr_users
          WHERE
              user_id = ${Message.member.id};`,
        async function(error, user, fields) {
          if (!user || !user[0]) {
            Message.member.db = await WDR.Save_User(WDR, Message, Server);
            Message.reply("Created database record for you. Please repeat the previous command.").then(m => m.delete({
              timeout: 5000
            })).catch(console.error);
          } else {
            Message.member.db = user[0];
            if (Message.member.db.location) {
              Message.member.db.location = JSON.parse(Message.member.db.location);
            }
            if (Message.member.db.locations) {
              Message.member.db.locations = JSON.parse(Message.member.db.locations);
            }
          }

          if (User.guild_name === 'Migrated' || User.areas === 'undefined') {
            WDR.wdrDB.query(`
                UPDATE
                    wdr_users
                SET
                    guild_name = '${Message.discord.name}',
                    areas = '${Message.discord.name}'
                WHERE
                    user_id = ${Message.member.id};`);
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
            case "l":
              command = "location";
              break;
            case "a":
              command = "area";
              break;
          }

          //try {
          if (WDR.Fs.existsSync(WDR.Dir + "/src/commands/subscription/" + command.toLowerCase() + "/begin.js")) {
            let Cmd = require(WDR.Dir + "/src/commands/subscription/" + command.toLowerCase() + "/begin.js");
            if (Cmd) {
              Cmd(WDR, Message);
            }
          } else if (WDR.Fs.existsSync(WDR.Dir + "/src/commands/subscription/" + command.toLowerCase() + ".js")) {
            let Cmd = require(WDR.Dir + "/src/commands/subscription/" + command.toLowerCase() + ".js");
            if (Cmd) {
              Cmd(WDR, Message);
            }
          } else {
            WDR.Console.error(WDR, "[handlers/commands.js] " + Message.content + " command does not exist.");
          }
          // } catch (error) {
          //   try {

          //     console.log("2", command.toLowerCase());
          //   } catch (error) {
          //     console.log("3", command.toLowerCase());
          //     //WDR.Console.error("[handlers/commands.js] Error Initializing Command", [command, error]);
          //   }
          // }
          if (user.user_name != Message.member.user.username) {
            WDR.wdrDB.query(`
                  UPDATE
                      wdr_users
                  SET
                      user_name = '${Message.member.user.username}'
                  WHERE
                      user_id = ${Message.member.id};
                `);
            WDR.wdrDB.query(`
                  UPDATE
                      wdr_subscriptions
                  SET
                      user_name = '${Message.member.user.username}'
                  WHERE
                      user_id = ${Message.member.id};
                `);
          }

          // END
          return;
        }
      );
    }
  });
}