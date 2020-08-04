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

      let number = await Functions.DetailCollect(WDR, Functions, "Remove", Member, Message, subscriptions, "Type the corressponding # of the subscription you would like to remove -OR- type \'all\'", sub_list);

      let old = subscriptions[number];

      let modified = subscriptions[number];

      old.name = WDR.Master.Pokemon[old.pokemon_id] ? WDR.Master.Pokemon[old.pokemon_id].name : "All Pokémon";
      if (WDR.Master.Pokemon[old.pokemon_id]) {
        old.form_name = WDR.Master.Pokemon[old.pokemon_id].forms[old.form] ? WDR.Master.Pokemon[old.pokemon_id].forms[old.form].form : "All";
      } else {
        old.form_name = "All";
      }

      // RETRIEVE POKEMON NAME FROM USER
      modified.pokemon = await Functions.DetailCollect(WDR, Functions, "Name", message, old.name, "Respond with \'All\'  or the Pokémon name. Names are not case-sensitive.", modified);
      modified.name = modified.pokemon.name ? modified.pokemon.name : modified.pokemon;
      modified.id = modified.pokemon.id ? modified.pokemon.id : modified.pokemon;

      modified.form = await Functions.DetailCollect(WDR, Functions, "Form", Member, Message, old.form, "Please respond with \'Next\', a Form Name of the specified Pokemon, -OR- type \'All\'. Type \'Cancel\' to Stop.", old);

      modified.league = await Functions.DetailCollect(WDR, Functions, "League", message, old.league, "Please respond with \'Great\', or \'Ultra\'.", sub);
      modified.league = modified.league.toLowerCase();

      modified.min_rank = await Functions.DetailCollect(WDR, Functions, "Rank", message, old.min_rank, "Please respond with a value between 0 and 4096 -OR- type \'All\'. Type \'Cancel\' to Stop.", sub);

      modified.min_lvl = await Functions.DetailCollect(WDR, Functions, "Level", message, olc.min_lvl, "Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.", sub);

      if (modified.min_lvl != 0 && modified.min_lvl != 1) {
        modified.min_cp = await Functions.DetailCollect(WDR, Functions, "CP", message, old.min_cp, "Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.", sub);
      } else {
        modified.min_cp = 0;
      }

      modified.areas = await Functions.DetailCollect(WDR, Functions, "Geofence", message, old.areas, "Please respond with \'Yes\', \'No\' or \'Areas Names\'", undefined);
      if (modified.areas == Message.Discord.name) {
        modified.geotype = "city";
      } else {
        modified.geotype = Member.db.geotype;
      }

      modified.confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", message, null, "Type \'Yes\' or \'No\'. Subscription will be saved.", sub);

      let modify = `
        UPDATE
            wdr_subscriptions
        SET
            areas = '${modified.areas}',
            geotype = '${modified.geotype}',
            pokemon_id = ${modified.id},
            form = ${modified.form},
            min_lvl = ${modified.min_lvl},
            max_lvl = ${modified.max_lvl},
            min_iv = ${modified.min_iv},
            max_iv = ${modified.max_iv},
            size = ${modified.size},
            gender = ${modified.gender},
            generation = ${modified.gen}
        WHERE
            user_id = ${Message.author.id}
            AND guild_id = ${Message.guild.id}
            AND sub_type = 'pokemon'
            AND pokemon_id = ${old.pokemon_id}
            AND form = ${old.form}
            AND min_lvl = ${old.min_lvl}
            AND max_lvl = ${old.max_lvl}
            AND min_iv = ${old.min_iv}
            AND max_iv = ${old.max_iv}
            AND size = ${old.size}
            AND gender = ${old.gender}
            AND generation = ${old.generation};
      `;
      WDR.wdrDB.query(
        modify,
        async function(error, existing) {
          if (error) {
            return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
              timeout: 10000
            }));
          } else {
            let modification_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
              .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
              .setTitle(modified.name + " Subscription Modified!")
              .setDescription("Saved to the subscription Database.")
              .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
            return Message.channel.send(modification_success).then(BotMsg => {
              return Functions.OptionCollect(WDR, Functions, "modify", Message, BotMsg, Member);
            });
          }
        }
      );
    }
  );
}