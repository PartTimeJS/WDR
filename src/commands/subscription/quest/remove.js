module.exports = (WDR, Functions, Message, Member) => {
  WDR.wdrDB.query(`
      SELECT
        *
      FROM
        wdr_subscriptions
      WHERE
        user_id = '${Member.id}'
          AND
        sub_type = 'quest';`,
    async function(error, subscriptions) {

      if (error) {
        WDR.Console.error(WDR, "[cmd/sub/raid/remove.js] Error Fetching Subscriptions to Create Subscription.", [sub, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));

      } else {
        if (subscriptions.length < 1) {
          let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle("You do not have any Quest Subscriptions!")
            .setFooter("You can type 'view', 'add', or 'remove'.");
          Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
            return Functions.OptionCollect(WDR, Functions, "remove", Message, BotMsg, Member);
          });

        } else {
          let sub_list = "";
          for (let s = 0, slen = subscriptions.length; s < slen; s++) {
            let choice = s + 1;
            let sub_data = subscriptions[s];
            sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.pokemon_id] ? WDR.Master.Pokemon[sub_data.pokemon_id].name : "All Raid Bosses";
            sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
            let data = "";
            if (sub_data.gym_id !== 0) {
              data += "　" + "Reward: " + "`" + sub_data.reward + "`" + "\n";
            }
            if (!data) {
              data = "　" + "`" + "All" + "`" + "\n";
            }
            sub_list += data + "\n";
          }
          sub_list = sub_list.slice(0, -1);

          let remove_id = await Functions.DetailCollect(WDR, Functions, "Remove", Member, Message, sub_list, "Type the Number of the Subscription you want to remove.", null);

          let remove = subscriptions[remove_id];

          let query = `
            DELETE FROM
                wdr_subscriptions
            WHERE
                user_id = '${Member.id}'
                  AND
                sub_type = 'quest'
                  AND
                reward = '${remove.reward}'
            ;`;
            
          WDR.wdrDB.query(
            query,
            function(error, user, fields) {
              if (error) {
                WDR.Console.error(WDR, "[src/cmd/quest/remove.js] Error Removing Subscription.", [query, error]);
                console.error(error);
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                  timeout: 10000
                }));
              } else {
                let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                  .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                  .setTitle("Quest Subscription Removed.")
                  .setDescription("Saved to the Database.")
                  .setFooter("You can type 'view', 'presets', 'add', or 'remove'.");
                return Message.channel.send(subscription_success).then(BotMsg => {
                  return Functions.OptionCollect(WDR, Functions, "complete", Message, BotMsg, Member);
                });
              }
            }
          );
        }
      }
    }
  );
}
