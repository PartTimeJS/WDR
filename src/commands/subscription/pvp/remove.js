module.exports = (WDR, Functions, Message, Member) => {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = ${Member.id}
        AND guild_id = ${Message.guild.id}
        AND sub_type = 'pvp'`,
    async function(error, subscriptions, fields) {
      if (!subscriptions || !subscriptions[0]) {
        let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("You do not have any PvP Subscriptions!")
          .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
        Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
        });
      } else {

        let sub_list = "";
        for (let s = 0, slen = subscriptions.length; s < slen; s++) {
          let choice = s + 1;
          let sub_data = subscriptions[s];
          sub_data.id = sub_data.id ? sub_data.id : sub_data.pokemon_id;
          sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.id] ? WDR.Master.Pokemon[sub_data.id].name : "All Pokémon";
          sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
          let data = "";
          if (sub_data.league != "all") {
            data += "　League: `" + sub_data.league + "`\n";
          }
          if (sub_data.form != 0) {
            data += "　Form: `" + sub_data.form == 0 ? "All" : WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
          }
          data += "　Min Rank: `" + sub_data.min_rank + "`\n";
          if (sub_data.min_lvl != 0 && sub_data.min_lvl != 1) {
            data += "　Min Lvl: `" + sub_data.min_lvl + "`\n";
          }
          if (sub_data.min_cp != 0) {
            data += "　Min CP: `" + sub_data.min_cp + "`\n";
          }
          if (sub_data.max_cp != 10000) {
            data += "　Max CP: `" + sub_data.max_cp + "`\n";
          }
          sub_list += data + "\n";
        }
        sub_list = sub_list.slice(0, -1);

        let number = await Functions.DetailCollect(WDR, Functions, "Remove", Member, Message, subscriptions, "Type the corressponding # of the subscription you would like to remove -OR- type \'all\'", sub_list);

        let remove = subscriptions[number];

        WDR.wdrDB.query(
          `DELETE FROM
              wdr_subscriptions
           WHERE
              user_id = ${Message.author.id}
              AND guild_id = ${Message.guild.id}
              AND sub_type = 'pokemon'
              AND pokemon_id = ${remove.pokemon_id}
              AND form = ${remove.form}
              AND min_rank = ${remove.min_rank}
              AND min_lvl = ${remove.min_lvl}
              AND league = ${remove.league}
              AND min_cp = ${remove.min_cp}
              AND max_cp = ${remove.max_cp}`,
          async function(error, result) {
            if (error) {
              WDR.Console.error(WDR, "[commands/pokemon.js] Error Removing Subscription.", [remove, error]);
              return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                timeout: 10000
              }));
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                .setTitle(WDR.Master.Pokemon[remove.pokemon_id].name + " PvP Subscription Removed!")
                .setDescription("Saved to the subscription Database.")
                .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
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