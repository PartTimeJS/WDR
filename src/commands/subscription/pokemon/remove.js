module.exports = (WDR, Functions, Message, Member) => {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = ${Member.id}
        AND guild_id = ${Message.guild.id}
        AND sub_type = 'pokemon'`,
    async function(error, subscriptions, fields) {
      if (!subscriptions || !subscriptions[0]) {
        let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("You do not have any Pokémon Subscriptions!")
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
          if (sub_data.form > 0) {
            data += "　Form: `" + WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
          }
          if (sub_data.min_iv != 0) {
            data += "　Min IV: `" + sub_data.min_iv + "`\n";
          }
          if (sub_data.max_iv != 100) {
            data += "　Max IV: `" + sub_data.max_iv + "`\n";
          }
          if (sub_data.min_lvl != 0 && sub_data.min_lvl != 1) {
            data += "　Min Lvl: `" + sub_data.min_lvl + "`\n";
          }
          if (sub_data.max_lvl != WDR.MaxLevel) {
            data += "　Max Lvl: `" + sub_data.max_lvl + "`\n";
          }
          if (sub_data.gender != 0) {
            let gender = await WDR.Get_Gender(sub_data.gender);
            data += "　Gender: `" + gender + "`\n";
          }
          if (sub_data.size != 0) {
            data += "　Size: `" + sub_data.size + "`\n";
          }
          if (sub_data.generation != 0) {
            data += "　Gen: `" + sub_data.generation + "`\n";
          }
          if (!data) {
            data = "　`All" + "`\n";;
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
              AND min_lvl = ${remove.min_lvl}
              AND max_lvl = ${remove.max_lvl}
              AND min_iv = ${remove.min_iv}
              AND max_iv = ${remove.max_iv}
              AND size = ${remove.size}
              AND gender = ${remove.gender}
              AND generation = ${remove.generation}`,
          async function(error, result) {
            if (error) {
              WDR.Console.error(WDR, "[commands/pokemon.js] Error Removing Subscription.", [remove, error]);
              console.error(error);
              return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                timeout: 10000
              }));
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                .setTitle(WDR.Master.Pokemon[remove.pokemon_id].name + " Subscription Removed!")
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