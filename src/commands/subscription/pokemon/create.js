module.exports = (WDR, Functions, Message, Member, advanced) => {
  WDR.wdrDB.query(
    `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          user_id = ${Member.id}
          AND guild_id = ${Message.guild.id};`,
    async function(error, subs) {
      if (error) {
        WDR.Console.error(WDR, "[subs/poke/create.js] Error Fetching Subscriptions to Create Subscription.", [sub, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else if (subs.length >= 50) {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Maximum Subscriptions Reached!")
          .setDescription("You are at the maximum of 50 subscriptions. Please remove one before adding another.")
          .setFooter("You can type \'view\', \'presets\', \'remove\', or \'edit\'.");
        Message.channel.send(subscription_success).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
        });
      } else {
        let create = {};
        create.pokemon = await Functions.DetailCollect(WDR, Functions, "Name", Member, Message, null, "Respond with \'All\' or the Pokémon Name and Form if it has one. Names are not case-sensitive.", create);
        if (create.pokemon.name) {
          create.name = create.pokemon.name;
          create.pokemon_id = create.pokemon.id;
          create.forms = create.pokemon.forms;
          create.form_ids = create.pokemon.form_ids;
        } else {
          create.name = "All";
          create.pokemon_id = 0;
        }

        if (create.id > 0) {
          create.form = await Functions.DetailCollect(WDR, Functions, "Form", Member, Message, null, "Please respond with a Form Name of the specified Pokemon -OR- type \'All\'. Type \'Cancel\' to Stop.", create);
        }

        if (advanced == true) {

          if (create.pokemon == 0) {
            create.pokemon_type = await Functions.DetailCollect(WDR, Functions, "Type", Member, Message, null, "Please respond with \'All\' or the Pokemon Type.", create);
            create.gen = await Functions.DetailCollect(WDR, Functions, "Generation", Member, Message, null, "Please respond with the Generation number -OR- type \'All\'. Type \'Cancel\' to Stop.", create);
          } else {
            create.pokemon_type = 0;
            create.gen = 0;
          }

          create.min_iv = await Functions.DetailCollect(WDR, Functions, "Minimum IV", Member, Message, null, "Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.", create);

          if (create.min_iv == 100) {
            create.max_iv = 100
          } else {
            create.max_iv = await Functions.DetailCollect(WDR, Functions, "Maximum IV", Member, Message, null, "Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.", create);
          }

          create.min_lvl = await Functions.DetailCollect(WDR, Functions, "Minimum Level", Member, Message, null, "Please respond with a value between 0 and " + WDR.MaxLevel + " or type \'All\'. Type \'Cancel\' to Stop.", create);

          if (create.min_lvl == WDR.MaxLevel) {
            create.max_lvl = WDR.MaxLevel;
          } else {
            create.max_lvl = await Functions.DetailCollect(WDR, Functions, "Maximum Level", Member, Message, null, "Please respond with a value between 0 and " + WDR.MaxLevel + " or type \'All\'. Type \'Cancel\' to Stop.", create);
          }

          if (create.pokemon > 0) {
            create.gender = await Functions.DetailCollect(WDR, Functions, "Gender", Member, Message, null, "Please respond with \'Male\' or \'Female\' or type \'All\'.", create);
            create.size = await Functions.DetailCollect(WDR, Functions, "Size", Member, Message, null, "Please respond with \'big\', \'large\', \'normal\', \'small\', \'tiny\' or \'All\'.", create);
            create.size = create.size.toLowerCase();
          } else {
            create.size = 0;
          }

          create.geofence = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, null, "Please respond with \'Yes\' or \'No\'", create);

        } else {

          create.form = 0;
          create.max_iv = 100;
          create.max_lvl = WDR.MaxLevel;
          create.gender = 4;
          create.pokemon_type = 0;
          create.gen = 0;
          create.size = 0;

          create.min_iv = await Functions.DetailCollect(WDR, Functions, "Minimum IV", Member, Message, null, "Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.", create);

          create.min_lvl = await Functions.DetailCollect(WDR, Functions, "Minimum Level", Member, Message, null, "Please respond with a value between 0 and " + WDR.MaxLevel + " or type \'All\'. Type \'Cancel\' to Stop.", create);

          create.geofence = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, null, "Please respond with \'Yes\' or \'No\'", create);
          create.geofence = create.geofence == "ALL" ? Message.Discord.name : create.geofence;
        }

        let confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", Member, Message, null, "Type \'Yes\' or \'No\'. Subscription will be saved.", create);

        let query =
          `INSERT INTO
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
                  min_lvl,
                  max_lvl,
                  min_iv,
                  max_iv,
                  size,
                  gender,
                  generation
              )
           VALUES
              (
                ${Message.author.id},
                '${Member.db.user_name}',
                ${Message.guild.id},
                '${Member.db.guild_name}',
                ${Member.db.bot},
                ${Member.db.pokemon_status},
                '${create.geofence}',
                '${Member.db.coords};${Member.db.distance}',
                'pokemon',
                ${create.pokemon_id},
                '${create.pokemon_type}',
                ${create.form},
                ${create.min_lvl},
                ${create.max_lvl},
                ${create.min_iv},
                ${create.max_iv},
                '${create.size}',
                ${create.gender},
                ${create.gen}
              );`;
        WDR.wdrDB.query(
          query,
          async function(error, result) {
            if (error) {
              if (error.toString().indexOf("Duplicate entry") >= 0) {
                let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                  .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                  .setTitle("Existing Subscription Found!")
                  .setDescription("Nothing Has Been Saved." + "\n" + +"\n" +
                    "Use the view to see if your overall or pokemon status is Active if you are not receiving DMs.")
                  .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
                Message.channel.send(subscription_success).then(BotMsg => {
                  return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
                });
              } else {
                WDR.Console.error(WDR, "[" + Functions.Dir + "] Error Inserting Subscription.", [query, error]);
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                  timeout: 10000
                }));
              }
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                .setTitle(create.name + " Subscription Complete!")
                .setDescription("Saved to the subscription Database.")
                .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
              Message.channel.send(subscription_success).then(BotMsg => {
                return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
              });
            }
          }
        );
      }
    }
  );
}