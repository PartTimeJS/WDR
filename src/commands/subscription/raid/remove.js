module.exports = (WDR, Functions, Message, Member, gym_name_array, gym_detail_array, gym_collection) => {

  WDR.wdrDB.query(
    `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          user_id = '${Member.id}'
            AND
            guild_id = '${Message.guild.id}'
            ;`,
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
            .setTitle("You do not have any Raid Subscriptions!")
            .setFooter("You can type 'view', 'add', or 'remove'.");
          Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
            return Functions.OptionCollect(WDR, Functions, "remove", Message, BotMsg, Member, gym_name_array, gym_detail_array, gym_collection);
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
              data += "　" + "Gym: " + "`" + sub_data.gym_name + "`" + "\n";
            }
            if (sub_data.min_lvl !== 1) {
              data += "　" + "Min Lvl: " + "`" + sub_data.min_lvl + "`" + "\n";
            }
            if (sub_data.max_lvl !== WDR.Max_Raid_Level) {
              data += "　" + "Max Lvl: " + "`" + sub_data.max_lvl + "`" + "\n";
            }
            if (!data) {
              data = "　" + "`" + "All" + "`" + "\n";
            }
            sub_list += data + "\n";
          }
          sub_list = sub_list.slice(0, -1);

          let remove_id = await Functions.DetailCollect(WDR, Functions, "Remove", Member, Message, sub_list, "Type the Number of the Subscription you want to remove.", null, gym_name_array, gym_detail_array, gym_collection);

          let remove = subscriptions[remove_id];

          let query = `
            DELETE FROM
                wdr_subscriptions
            WHERE
                user_id = '${Member.id}'
                  AND
                gym_id = '${remove.gym_id}'
                  AND
                pokemon_id = ${remove.pokemon_id}
                  AND
                min_lvl = ${remove.min_lvl}
                  AND
                max_lvl = ${remove.max_lvl}
            ;`;
          WDR.wdrDB.query(
            query,
            function(error, user, fields) {
              if (error) {
                WDR.Console.error(WDR, "[src/cmd/raid/remove.js] Error Removing Subscription.", [query, error]);
                console.error(error);
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                  timeout: 10000
                }));
              } else {
                let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                  .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                  .setTitle("Raid Subscription Removed.")
                  .setDescription("Saved to the Database.")
                  .setFooter("You can type 'view', 'presets', 'add', or 'remove'.");
                return Message.channel.send(subscription_success).then(BotMsg => {
                  return Functions.OptionCollect(WDR, Functions, "complete", Message, BotMsg, Member, gym_name_array, gym_detail_array, gym_collection);
                });
              }
            }
          );
        }
      }
    }
  );
}