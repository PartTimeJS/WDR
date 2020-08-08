module.exports = (WDR, Functions, Message, Member) => {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = ${Member.id}
          AND
        sub_type = 'pvp'`,
    async function(error, subscriptions, fields) {
      if (!subscriptions || !subscriptions[0]) {
        let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("You do not have any PvP Subscriptions!")
          .setFooter("You can type \'view\', \'presets\', \'add\', \'remove\', or \'edit\'.");
        Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
        });
      } else {

        let sub_list = "";
        for (let s = 0, slen = subscriptions.length; s < slen; s++) {
          let choice = s + 1;
          let sub_data = subscriptions[s];
          sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.pokemon_id] ? WDR.Master.Pokemon[sub_data.pokemon_id].name : "All Pokémon";
          sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
          let data = "";
          data += "　Min Rank: `" + sub_data.min_rank + "`\n";
          if (sub_data.form != 0) {
            data += "　Form: `" + WDR.Master.Pokemon[sub_data.pokemon_id].forms[sub_data.form].form + "`\n";
          }
          if (sub_data.league != "0") {
            data += "　League: `" + sub_data.league + "`\n";
          }
          if (sub_data.pokemon_type != "0") {
            data += "　Type: `" + sub_data.pokemon_type + "`\n"
          }
          if (sub_data.generation != 0) {
            data += "　Gen: `" + sub_data.generation + "`\n";
          }

          sub_list += data + "\n";
        }
        sub_list = sub_list.slice(0, -1);

        let number = await Functions.DetailCollect(WDR, Functions, "Remove", Member, Message, subscriptions, "Type the corressponding # of the subscription you would like to remove -OR- type \'all\'", sub_list);

        let remove = subscriptions[number];

        let query = `
          DELETE FROM
              wdr_subscriptions
          WHERE
              user_id = ${Message.author.id}
              AND guild_id = ${Message.guild.id}
              AND sub_type = 'pvp'
              AND pokemon_id = ${remove.pokemon_id}
              AND form = ${remove.form}
              AND min_rank = ${remove.min_rank}
              AND league = ${remove.league};
        `;

        WDR.wdrDB.query(
          query,
          async function(error, result) {
            if (error) {
              WDR.Console.error(WDR, "[cmd/pvp/remove.js] Error Removing Subscription.", [query, error]);
              return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                timeout: 10000
              }));
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                .setTitle(WDR.Master.Pokemon[remove.pokemon_id].name + " PvP Subscription Removed!")
                .setDescription("Saved to the subscription Database.")
                .setFooter("You can type \'view\', \'presets\', \'add\', \'remove\', or \'edit\'.");
              return Message.channel.send(subscription_success).then(BotMsg => {
                return Functions.OptionCollect(WDR, Functions, "remove", Message, BotMsg, Member);
              });
            }
          }
        );
      }
    }
  );
}