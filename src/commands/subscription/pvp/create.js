module.exports = async (WDR, Functions, Message, Member, advanced) => {

  WDR.wdrDB.query(
    `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          user_id = ${Member.id};`,
    async function(error, subs) {
      if (error) {
        WDR.Console.error(WDR, "[database.js] Error Fetching Subscriptions to Create Subscription.", [sub, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else if (subs.length >= 25) {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Maximum Subscriptions Reached!")
          .setDescription("You are at the maximum of 25 subscriptions. Please remove one before adding another.")
          .setFooter("You can type \'view\', \'presets\', \'remove\', or \'edit\'.");
        Message.channel.send(subscription_success).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
        });
      } else {
        let create = {};
        create.pokemon = await Functions.DetailCollect(WDR, Functions, "Name", Member, Message, null, "Respond with \'All\'  or the Pokémon name. Names are not case-sensitive.", create);
        if (create.pokemon.name) {
          create.name = create.pokemon.name;
          create.pokemon_id = create.pokemon.id;
          create.forms = create.pokemon.forms;
        } else {
          create.name = "All";
          create.pokemon_id = 0;
        }
        if (create.pokemon_id > 0) {
          create.form = await Functions.DetailCollect(WDR, Functions, "Form", Member, Message, null, "Please respond with a Form Name of the specified Pokemon -OR- type \'All\'. Type \'Cancel\' to Stop.", create);
          create.league = 0;
          create.pokemon_type = 0;
        } else {
          create.form = 0;
          create.league = await Functions.DetailCollect(WDR, Functions, "League", Member, Message, null, "Please respond with \'Great\', \'Ultra\'.", create);
          create.league = create.league.toLowerCase();
          create.pokemon_type = await Functions.DetailCollect(WDR, Functions, "Type", Member, Message, null, "Please respond with \'All\' or the Pokemon Type.", create);
          if (create.pokemon_type == 0) {
            create.gen = await Functions.DetailCollect(WDR, Functions, "Generation", Member, Message, null, "Please respond with the Generation number -OR- type \'All\'. Type \'Cancel\' to Stop.", create);
          } else {
            create.gen = 0;
          }
        }
        create.min_rank = await Functions.DetailCollect(WDR, Functions, "Minimum Rank", Member, Message, null, "Please respond with a value between 1 and 20. Type \'Cancel\' to Stop.", create);
        // create.min_lvl = await Functions.DetailCollect(WDR, Functions, "Minimum CP", Member, Message, create.name, "Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.", create);
        // if (create.min_lvl != 0 && create.min_lvl != 1) {
        //   create.min_cp = await Functions.DetailCollect(WDR, Functions, "Minimum CP", Member, Message, create.name, "Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.", create);
        // } else {
        //   create.min_cp = 0;
        // }
        create.geofence = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, null, "Please respond with \'Yes\', \'No\' or \'Areas Names\'", create);
        create.geofence = create.geofence == "ALL" ? Message.Discord.name : create.geofence;
        let confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", Member, Message, null, "Type \'Yes\' or \'No\'. Subscription will be saved.", create);
        let query = `
          INSERT INTO
              wdr_subscriptions (
                  user_id,
                  user_name,
                  guild_id,
                  guild_name,
                  bot,
                  status,
                  geofence,
                  distance,
                  sub_type,
                  pokemon_id,
                  pokemon_type,
                  form,
                  league,
                  min_rank,
                  generation
                )
           VALUES
              (
                ${Member.id},
                '${Member.db.user_name}',
                ${Message.guild.id},
                '${Member.db.guild_name}',
                ${Member.db.bot},
                ${Member.db.pvp_status},
                '${create.geofence}',
                '${Member.db.coords};${Member.db.distance}',
                'pvp',
                ${create.pokemon_id},
                '${create.pokemon_type}',
                ${create.form},
                '${create.league}',
                ${create.min_rank},
                ${create.gen}
              );`;
        WDR.wdrDB.query(
          query,
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
                WDR.Console.error(WDR, "[commands/pokemon.js] Error Inserting Subscription.", [query, error]);
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
                return Functions.OptionCollect(WDR, Functions, "create", Message, msg, Member);
              });
            }
          }
        );
      }
    }
  );
}