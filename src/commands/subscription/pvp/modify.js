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
          .setFooter("You can type 'view', 'presets', 'add', 'remove', or 'edit'.");
        Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
        });
      }

      let sub_list = "";
      for (let s = 0, slen = subscriptions.length; s < slen; s++) {
        let choice = s + 1;
        let sub_data = subscriptions[s];
        sub_data.id = sub_data.id ? sub_data.id : sub_data.pokemon_id;
        sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.id] ? WDR.Master.Pokemon[sub_data.id].name : "All Pokémon";
        sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
        let data = "";
        if (sub_data.form != 0) {
          data += "　Form: `" + sub_data.form == 0 ? "All" : WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
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
        data += "　Min Rank: `" + sub_data.min_rank + "`\n";
        sub_list += data + "\n";
      }
      sub_list = sub_list.slice(0, -1);

      let number = await Functions.DetailCollect(WDR, Functions, "Remove", Member, Message, subscriptions, "Type the corressponding # of the subscription you would like to remove -OR- type 'all'", sub_list);

      let old = subscriptions[number];

      let modified = subscriptions[number];

      old.name = WDR.Master.Pokemon[old.pokemon_id] ? WDR.Master.Pokemon[old.pokemon_id].name : "All Pokémon";
      if (WDR.Master.Pokemon[old.pokemon_id]) {
        old.form_name = WDR.Master.Pokemon[old.pokemon_id].forms[old.form] ? WDR.Master.Pokemon[old.pokemon_id].forms[old.form].form : "All";
      } else {
        old.form_name = "All";
      }

      // RETRIEVE POKEMON NAME FROM USER
      modified.pokemon = await Functions.DetailCollect(WDR, Functions, "Name", Member, Message, old.name, "Respond with 'All'  or the Pokémon name. Names are not case-sensitive.", modified);
      modified.name = modified.pokemon.name ? modified.pokemon.name : modified.pokemon;
      modified.pokemon_id = modified.pokemon.id ? modified.pokemon.id : modified.pokemon;

      if (modified.pokemon_id > 0) {
        modified.form = await Functions.DetailCollect(WDR, Functions, "Form", Member, Message, old.form, "Please respond with 'Next', a Form Name of the specified Pokemon, -OR- type 'All'. Type 'Cancel' to Stop.", old);
      } else {
        modified.form = 0;
      }

      modified.league = await Functions.DetailCollect(WDR, Functions, "League", Member, Message, old.league, "Please respond with 'Great', or 'Ultra'.", modified);
      modified.league = modified.league.toLowerCase();

      modified.min_rank = await Functions.DetailCollect(WDR, Functions, "Rank", Member, Message, old.min_rank, "Please respond with a value between 0 and 4096 -OR- type 'All'. Type 'Cancel' to Stop.", modified);

      //modified.min_lvl = await Functions.DetailCollect(WDR, Functions, "Level", Message, olc.min_lvl, "Please respond with a number greater than 0 or 'All'. Type 'Cancel' to Stop.", modified);

      // if (modified.min_lvl != 0 && modified.min_lvl != 1) {
      //   modified.min_cp = await Functions.DetailCollect(WDR, Functions, "CP", Message, old.min_cp, "Please respond with a number greater than 0 or 'All'. Type 'Cancel' to Stop.", modified);
      // } else {
      //   modified.min_cp = 0;
      // }

      modified.areas = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, old.areas, "Please respond with 'Yes', 'No'", undefined);
      if (modified.areas == Message.Discord.name) {
        modified.geotype = "city";
      } else {
        modified.geotype = Member.db.geotype;
      }

      modified.confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", Member, Message, null, "Type 'Yes' or 'No'. Subscription will be saved.", modified);

      let query = `
        UPDATE
            wdr_subscriptions
        SET
            areas = '${modified.areas}',
            geotype = '${modified.geotype}',
            pokemon_id = ${modified.pokemon_id},
            form = ${modified.form},
            areas = '${modified.areas}',
            geotype = '${modified.geotype}',
            league = '${modified.league}',
            min_rank = ${modified.min_rank}
        WHERE
            user_id = ${Message.author.id}
            AND areas = '${old.areas}'
            AND geotype = '${old.geotype}'
            AND pokemon_id = ${old.pokemon_id}
            AND form = ${old.form}
            AND areas = '${old.areas}'
            AND geotype = '${old.geotype}'
            AND league = '${old.league}'
            AND min_rank = ${old.min_rank};
      `;
      WDR.wdrDB.query(
        query,
        async function(error, existing) {
          if (error) {
            WDR.Console.error(WDR, "[cmd/pvp/remove.js] Error Modifying Subscription.", [query, error])
            return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
              timeout: 10000
            }));
          } else {
            let modification_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
              .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
              .setTitle(modified.name + " Subscription Modified!")
              .setDescription("Saved to the subscription Database.")
              .setFooter("You can type 'view', 'presets', 'add', 'remove', or 'edit'.");
            return Message.channel.send(modification_success).then(BotMsg => {
              return Functions.OptionCollect(WDR, Functions, "modify", Message, BotMsg, Member);
            });
          }
        }
      );
    }
  );
}