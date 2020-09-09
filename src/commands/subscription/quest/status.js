module.exports = (WDR, Functions, Message, Member) => {
  WDR.wdrDB.query(`
      SELECT
        *
      FROM
        users
      WHERE
        user_id = '${Member.id}'
          AND 
        guild_id = '${Message.guild.id};`,
    function(error, user) {
      if (error) {
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);

      } else if (!user || !user[0]) {
        WDR.Console.error(WDR, "[COMMANDS] [" + WDR.Time(null, "stamp") + "] [raid.js/(subscription_status)] Could not retrieve user: " + Member.nickname + " entry from dB.");
        return Message.reply("There has been an error retrieving your user data from the dB contact an Admin to fix.");

      } else if (user[0].quests_status === 1 && reason == "resume") {
        let already_active = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Your Quest subscriptions are already **Active**!")
          .setFooter("You can type 'view', 'add', or 'remove'.");
        message.channel.send(already_active).catch(console.error).then(msg => {
          return initiate_collector(WDR, "view", message, msg, member, prefix);
        });

      } else if (user[0].quests_status === 0 && reason == "pause") {
        let already_paused = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Your Quest subscriptions are already **Paused**!")
          .setFooter("You can type 'view', 'add', or 'remove'.");
        message.channel.send(already_paused).catch(console.error).then(msg => {
          return initiate_collector(WDR, "view", message, msg, member, prefix);
        });

      } else {
        if (reason == "pause") {
          change = 0;
        }
        if (reason == "resume") {
          change = 1;
        }

        WDR.wdrDB.query(`
            UPDATE
              users
            SET
              quest_status = ${change}
            WHERE
              user_id = '${Member.id}'
                AND
              guild_id = '${Message.guild.id}';`,
          function(error) {
            if (error) {
              return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                .setTitle("Your Quest subscriptions have been set to `" + change + "`!")
                .setFooter("Saved to the Database.");
              return message.channel.send(subscription_success).then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            }
          }
        );
      }
    }
  );
}
