module.exports = (WDR, Functions, Message, Member) => {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = '${Member.id}'
          AND
        guild_id = ${Message.guild.id}
          AND
        sub_type = 'pvp'`,
    async function(error, subscriptions) {
      if (!subscriptions || subscriptions.length < 1) {
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
          if(sub_data.geotype !== "city"){
            if(sub_data.geotype === "location"){
              data += "　" +  "Area: " + "`" + JSON.parse(sub_data.location).name + "`";
            } else {
              data += "　" +  "Area: " + "`" + sub_data.areas + "`" + "\n";
            }
          } else {
            data += "　" +  "Area: " + "`All`"+ "\n";
          }
          sub_list += data + "\n";
        }
        sub_list = sub_list.slice(0, -1);

        let o_status = Member.db.status === 1 ? "Enabled" : "Disabled";
        let p_status = Member.db.pvp_status === 1 ? "Enabled" : "Disabled";
        let pokemonSubs = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Your PvP Subscriptions")
          .setDescription("Overall Status: `" + o_status + "`\n" +
            "PvP Status: `" + p_status + "`\n\n" + sub_list)
          .setFooter("You can type \'view\', \'presets\', \'add\', \'remove\', or \'edit\'.");
        Message.channel.send(pokemonSubs).catch(console.error).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
        });
      }
    }
  );
}
