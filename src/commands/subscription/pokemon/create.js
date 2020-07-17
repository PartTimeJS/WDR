module.exports = (WDR, Functions, Message, Member, advanced) => {
  WDR.wdrDB.query(
    `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          user_id = ${Member.id}
          AND guild_id = ${Message.guild.id}
          AND sub_type = 'pokemon'`,
    async function(error, subs) {
      if (error) {
        WDR.Console.error(WDR, "[subs/poke/create.js] Error Fetching Subscriptions to Create Subscription.", [sub, error]);
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
        let sub = {};
        sub.pokemon = await Functions.DetailCollect(WDR, Functions, "Name", Member, Message, null, "Respond with \'All\' or the Pokémon Name and Form if it has one. Names are not case-sensitive.", sub);
        sub.name = sub.pokemon.name ? sub.pokemon.name : sub.pokemon;
        sub.id = sub.pokemon.id ? sub.pokemon.id : sub.pokemon;
        if (sub.name == 0) {
          sub.name = "All";
        }

        if (sub.id > 0) {
          sub.form = await Functions.DetailCollect(WDR, Functions, "Form", Member, Message, null, "Please respond with a Form Name of the specified Pokemon -OR- type \'All\'. Type \'Cancel\' to Stop.", sub);
        }

        if (advanced == true) {

          if (sub.pokemon == 0) {
            sub.gen = await Functions.DetailCollect(WDR, Functions, "Generation", Member, Message, null, "Please respond with the Generation number -OR- type \'All\'. Type \'Cancel\' to Stop.", sub);
          }

          sub.min_iv = await Functions.DetailCollect(WDR, Functions, "Minimum IV", Member, Message, null, "Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.", sub);

          if (sub.min_iv == 100) {
            sub.max_iv = 100
          } else {
            sub.max_iv = await Functions.DetailCollect(WDR, Functions, "Maximum IV", Member, Message, null, "Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.", sub);
          }

          sub.min_lvl = await Functions.DetailCollect(WDR, Functions, "Minimum Level", Member, Message, null, "Please respond with a value between 0 and " + WDR.MaxLevel + " or type \'All\'. Type \'Cancel\' to Stop.", sub);

          if (sub.min_lvl == WDR.MaxLevel) {
            sub.max_lvl = WDR.MaxLevel;
          } else {
            sub.max_lvl = await Functions.DetailCollect(WDR, Functions, "Maximum Level", Member, Message, null, "Please respond with a value between 0 and " + WDR.MaxLevel + " or type \'All\'. Type \'Cancel\' to Stop.", sub);
          }

          if (sub.pokemon > 0) {
            sub.gender = await Functions.DetailCollect(WDR, Functions, "Gender", Member, Message, null, "Please respond with \'Male\' or \'Female\' or type \'All\'.", sub);
            sub.size = await Functions.DetailCollect(WDR, Functions, "Size", Member, Message, null, "Please respond with \'big\', \'large\', \'normal\', \'small\', \'tiny\' or \'All\'.", sub);
            sub.size = sub.size.toLowerCase();
          } else {
            sub.size = 0;
          }

          sub.geofence = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, null, "Please respond with \'Yes\' or \'No\'", sub);

        } else {

          sub.form = 0;
          sub.max_iv = 100;
          sub.max_lvl = WDR.MaxLevel;
          sub.gender = 4;
          sub.gen = 0
          sub.size = 0;

          sub.min_iv = await Functions.DetailCollect(WDR, Functions, "Minimum IV", Member, Message, null, "Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.", sub);

          sub.min_lvl = await Functions.DetailCollect(WDR, Functions, "Minimum Level", Member, Message, null, "Please respond with a value between 0 and " + WDR.MaxLevel + " or type \'All\'. Type \'Cancel\' to Stop.", sub);

          sub.geofence = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, null, "Please respond with \'Yes\' or \'No\'", sub);
          sub.geofence = sub.geofence == "ALL" ? Message.Discord.name : sub.geofence;
        }

        let confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", Member, Message, null, "Type \'Yes\' or \'No\'. Subscription will be saved.", sub);

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
                  sub_type,
                  pokemon_id,
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
                '${sub.geofence}',
                'pokemon',
                ${sub.id},
                ${sub.form},
                ${sub.min_lvl},
                ${sub.max_lvl},
                ${sub.min_iv},
                ${sub.max_iv},
                '${sub.size}',
                ${sub.gender},
                ${sub.gen}
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
                .setTitle(sub.name + " Subscription Complete!")
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