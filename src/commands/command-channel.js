module.exports = (WDR, message) => {

    if (message.member.isAdmin || message.member.isMod) {
    /* DO NOTHING */
    } else if (message.discord.donor_role && !message.member.roles.cache.has(message.discord.donor_role)) {
        if (WDR.Config.log_channel) {
            let nondonor_embed = new WDR.DiscordJS.MessageEmbed()
            .setColor("ff0000")
            .addField("User attempted to use a subsciption command, not a donor. ", message.member.user.username);
            if (WDR.Config.donor_info) {
                message.donor_info = WDR.Config.donor_info;
            } else {
                message.donor_info = "";
            }
            message.guild.members.fetch(message.author.id).then(TARGET => {
                TARGET.send("This feature is only for donors. " + message.donor_info).catch(console.error);
            });
            return WDR.Send_Embed(WDR, "member", 0, message.discord.id, "", nondonor_embed, WDR.Config.log_channel);
        } else {
            return console.log(WDR.Color.red + "User attempted to use DM command, not a donor. " + message.member.user.username + WDR.Color.reset);
        }
    }

    WDR.wdrDB.query(`
        SELECT
            *
        FROM
            wdr_users
        WHERE
            user_id = ${message.member.id}
                AND
            guild_id = ${message.guild.id};`,
        async function(error, user) {
            if (!user || !user[0]) {
                message.member.db = await WDR.Save_User(WDR, message, message.discord);
                message.reply("Created database record for you. Please repeat the previous command.").then(m => m.delete({
                    timeout: 5000
                })).catch(console.error);
            } else {
                message.member.db = user[0];
                if (message.member.db.location) {
                    message.member.db.location = JSON.parse(message.member.db.location);
                }
                if (message.member.db.locations) {
                    message.member.db.locations = JSON.parse(message.member.db.locations);
                }
            }

            if (message.member.db.guild_name === 'Migrated' || message.member.db.areas === 'undefined') {
            WDR.wdrDB.query(`
                UPDATE
                    wdr_users
                SET
                    guild_name = '${message.discord.name}',
                    areas = '${message.discord.name}'
                WHERE
                    user_id = ${message.member.id}
                        AND
                    guild_id = ${message.guild.id};`);
            }

            let command = message.content.split(" ")[0].slice(1);

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
                    Cmd(WDR, message);
                }
            } else if (WDR.Fs.existsSync(WDR.Dir + "/src/commands/subscription/" + command.toLowerCase() + ".js")) {
                let Cmd = require(WDR.Dir + "/src/commands/subscription/" + command.toLowerCase() + ".js");
                if (Cmd) {
                    Cmd(WDR, message);
                }
            } else if (WDR.Fs.existsSync(WDR.Dir + "/src/commands/" + command.toLowerCase() + ".js")) {
            let Cmd = require(WDR.Dir + "/src/commands/" + command.toLowerCase() + ".js");
                if (Cmd) {
                    Cmd(WDR, message);
                }
            } else {
                WDR.Console.error(WDR, "[handlers/commands.js] " + message.content + " command does not exist.");
            }
            // } catch (error) {
            //   try {

            //     console.log("2", command.toLowerCase());
            //   } catch (error) {
            //     console.log("3", command.toLowerCase());
            //     //WDR.Console.error("[handlers/commands.js] Error Initializing Command", [command, error]);
            //   }
            // }
            if (user.user_name != message.member.user.username) {
                WDR.wdrDB.query(`
                        UPDATE
                            wdr_users
                        SET
                            user_name = '${message.member.user.username.replace(/[\W]+/g, "")}'
                        WHERE
                            user_id = ${message.member.id};
                    `);
                WDR.UpdateAllSubTables(WDR, `UPDATE %TABLE% SET user_name = '${message.member.user.username.replace(/[\W]+/g, "")}' WHERE user_id = ${message.member.id}`);
            }

            // END
            return;
        }
    );
}
