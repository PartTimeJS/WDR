module.exports = async (WDR, Functions, Message, Member, advanced) => {
  WDR.wdrDB.query(
    `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          user_id = ${Member.id}
          AND guild_id = ${Message.guild.id}
          AND sub_type = 'pvp'`,
    async function(error, subs) {
      if (error) {
        WDR.Console.error(WDR, "[database.js] Error Fetching Subscriptions to Create Subscription.", [sub, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else if (subs.length >= 25) {
        let create = {};
        create.name = await Functions.DetailCollect(WDR, Functions, "Name", message, undefined, "Respond with \'All\'  or the Pokémon name. Names are not case-sensitive.", sub);
        create.name = create.pokemon.name ? create.pokemon.name : create.pokemon;
        create.id = create.pokemon.id ? create.pokemon.id : create.pokemon;
        if (create.id == 0) {
          create.league = await Functions.DetailCollect(WDR, Functions, "League", message, create.name, "Please respond with \'Great\', \'Ultra\'.", sub);
          create.league = create.league.toLowerCase();
          create.type = await Functions.DetailCollect(WDR, Functions, "Type", message, create.name, "Please respond with \'Great\', \'Ultra\'.", sub);
        } else {
          create.league = 0;
          create.type = 0;
        }
        create.min_rank = await Functions.DetailCollect(WDR, Functions, "Minimum Rank", message, create.name, "Please respond with a value between 1 and 20. Type \'Cancel\' to Stop.", sub);
        create.min_lvl = await Functions.DetailCollect(WDR, Functions, "Minimum CP", message, create.name, "Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.", sub);
        // if (create.min_lvl != 0 && create.min_lvl != 1) {
        //   create.min_cp = await Functions.DetailCollect(WDR, Functions, "Minimum CP", message, create.name, "Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.", sub);
        // } else {
        //   create.min_cp = 0;
        // }
        create.areas = await Functions.DetailCollect(WDR, Functions, "Geofence", message, create.name, "Please respond with \'Yes\', \'No\' or \'Areas Names\'", undefined);
        let confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", message, create.name, "Type \'Yes\' or \'No\'. Subscription will be saved.", sub);
        WDR.wdrDB.query(
          `INSERT INTO
              wdr_subscriptions (
                  user_id,
                  user_name,
                  guild_id,
                  guild_name,
                  bot,
                  status,
                  geofence,
                  coords,
                  sub_type,
                  pokemon_id,
                  form,
                  min_lvl,
                  league,
                  min_rank
                )
           VALUES
              (
                ${Member.id},
                ${Member.db.user_name},
                ${Message.guild.id},
                ${Member.db.guild_name},
                ${Member.db.bot},
                ${Member.db.pvp_status},
                ${create.geofence},
                ${Member.db.coords},
                'pvp',
                ${create.id},
                ${create.type}
                ${create.form},
                ${create.min_lvl},
                ${create.league},
                ${create.min_rank}
          )`,
          async function(error, result) {
            if (error) {
              if (error.toString().indexOf("Duplicate entry") >= 0) {
                let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
                  .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                  .setTitle("Existing Subscription Found!")
                  .setDescription("Nothing has been saved.")
                  .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
                Message.channel.send(subscription_success).then(BotMsg => {
                  return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
                });
              } else {
                WDR.Console.error(WDR, "[commands/pokemon.js] Error Inserting Subscription.", [preset, error]);
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                  timeout: 10000
                }));
              }
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                .setTitle(create.name + " PvP Subscription Complete!")
                .setDescription("Saved to the Database.")
                .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
              Message.channel.send(subscription_success).then(msg => {
                return Functions.OptionCollect(WDR, Functions, "create", message, msg, prefix);
              });
            }
          }
        );
      }
    }
  );
}