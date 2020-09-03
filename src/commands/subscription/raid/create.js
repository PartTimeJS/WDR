const Fuzzy = require("fuzzy");

module.exports = (WDR, Functions, Message, Member, gym_name_array, gym_detail_array, gym_collection) => {

  WDR.wdrDB.query(
    `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          user_id = ${Member.id}
            AND
          sub_type = 'raid';`,
    async function(error, subs) {
      if (error) {
        WDR.Console.error(WDR, "[cmd/sub/raid/create.js] Error Fetching Subscriptions to Create Subscription.", [create, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else if (subs.length >= 20) {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Maximum Subscriptions Reached!")
          .setDescription("You are at the maximum of 20 subscriptions. Please remove one before adding another.")
          .setFooter("You can type 'view', 'presets', 'remove', or 'edit'.");
        Message.channel.send(subscription_success).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
        });
      } else {

        let create = {},
          got_name = false;

        do {
          create.gym = await Functions.DetailCollect(WDR, Functions, "Gym", Member, Message, null, "Respond with 'All'  or a Gym Name. Names are not case-sensitive.", create, gym_name_array, gym_detail_array, gym_collection);
          if (create.gym === 0) {
            create.name = "All";
            create.gym = "All";
            create.gym_id = 0;
            got_name = true;

          } else if (create.gym.fuzzy) {
            let results = Fuzzy.filter(create.gym.fuzzy, gym_name_array);

            if (results.length === 1) {
              let result_match = gym_collection.get(results[0].string);
              create.gym_id = result_match.id;
              create.gym = result_match.name;
              create.name = result_match.name;
              got_name = true;
            } else {
              //let matches = results.map(el => el.string);
              let matches = results.map(function(el) {
                console.log("1", el);
                let index = gym_name_array.indexOf(el);
                console.log("2", index);
                console.log("3", gym_detail_array[index]);
                return el.string;
              });

              if (matches.length < 1) {
                Message.reply("`" + create.gym.fuzzy + "`, does not closely match any gym in the database.").then(m => m.delete({
                  timeout: 8000
                })).catch(console.error);

              } else {
                let user_choice = await Functions.MatchCollect(WDR, Functions, "Matches", Member, Message, matches, "Type the number of the Correct Gym.", create, gym_name_array, gym_detail_array, gym_collection);
                console.log(user_choice)
                let collection_match = gym_collection.get(matches[user_choice]);
                if (collection_match) {
                  create.gym_id = collection_match.id;
                  create.gym = collection_match.name;
                  create.name = collection_match.name;
                  got_name = true;
                }
              }
            }

          } else if (create.gym.length > 1) {
            let user_choice = await Functions.MatchCollect(WDR, "Multiple", Member, Message, null, "Type the number of the Correct Gym.", create, gym_name_array, gym_detail_array, gym_collection);
            create.gym_id = create.gym[user_choice].id;
            create.gym = create.gym[user_choice].name;
            create.name = create.gym[user_choice].name;
            got_name = true;

          } else {
            create.gym_id = create.gym[0].id;
            create.gym = create.gym[0].name;
            create.name = create.gym[0].name;
            got_name = true;
          }
        }
        while (got_name == false);

        console.log(create)

        create.pokemon = await Functions.DetailCollect(WDR, Functions, "Name", Member, Message, null, "Respond with 'All', 'Egg' or the Raid Boss's name. Names are not case-sensitive.", create, gym_name_array, gym_detail_array, gym_collection);
        if (create.pokemon.name) {
          create.boss = create.pokemon.name;
          create.name += " " + create.pokemon.name;
          create.pokemon_id = create.pokemon.id;
          create.forms = create.pokemon.forms;
          create.form_ids = create.pokemon.form_ids;
        } else if (create.pokemon === -2) {
          create.name += " Eggs";
          create.boss = "Eggs";
          create.pokemon_id = -2;
        } else if (create.pokemon === -1) {
          create.name += " Eggs & Bosses";
          create.boss = "Eggs & Bosses";
          create.pokemon_id = 0;
        } else {
          create.name += " Bosses";
          create.boss = "Bosses";
          create.pokemon_id = 0;
        }

        if (create.pokemon_id === 0) {
          create.min_lvl = await Functions.DetailCollect(WDR, Functions, "Minimum Level", Member, Message, null, "Please respond with a value of 1 through " + WDR.Max_Raid_Level + " or type 'All'. Type 'Cancel' to Stop.", create, gym_name_array, gym_detail_array, gym_collection);

          if (create.min_lvl == WDR.Max_Raid_Level) {
            create.max_lvl = WDR.Max_Raid_Level;
          } else {
            create.max_lvl = await Functions.DetailCollect(WDR, Functions, "Maximum Level", Member, Message, null, "Please respond with a value of 1 through " + WDR.Max_Raid_Level + " or type 'All'. Type 'Cancel' to Stop.", create, gym_name_array, gym_detail_array, gym_collection);
            console.log(create.max_lvl)
          }

        } else {
          create.min_lvl = 1;
          create.max_lvl = WDR.Max_Raid_Level;
        }

        if (create.gym === 0) {
          create.geotype = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, null, "Please respond with 'Yes' or 'No'", create, gym_name_array, gym_detail_array, gym_collection);
          if (create.geotype == "location") {
            create.areas = Member.db.location.name;
          } else if (create.geotype == "areas") {
            create.areas = Member.db.areas;
          }
        } else {
          create.geotype = "city";
          create.areas = "All"
        }

        create.confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", Member, Message, null, "Type 'Yes' or 'No'. Subscription will be saved.", create, gym_name_array, gym_detail_array, gym_collection);
        if (create.confirm === false) {
          Functions.Cancel(WDR, Functions, Message, Member);
        }

        create.gym = create.gym.replace("'", "");
        create.gym = create.gym.replace(/[\W]+/g, "");

        let query = `
          INSERT INTO
              wdr_subscriptions (
                  user_id,
                  user_name,
                  guild_id,
                  guild_name,
                  bot,
                  status,
                  geotype,
                  areas,
                  location,
                  sub_type,
                  pokemon_id,
                  gym_id,
                  gym_name,
                  min_lvl,
                  max_lvl
                )
           VALUES
              (
                ${Member.id},
                '${Member.db.user_name}',
                ${Message.guild.id},
                '${Member.db.guild_name}',
                ${Member.db.bot},
                ${Member.db.pvp_status},
                '${create.geotype}',
                '${Member.db.areas}',
                '${JSON.stringify(Member.db.location)}',
                'raid',
                ${create.pokemon_id},
                '${create.gym_id}',
                '${create.gym}',
                ${create.min_lvl},
                '${create.max_lvl}'
              )
          ;`;
        WDR.wdrDB.query(
          query,
          async function(error, result) {
            if (error) {
              if (error.toString().indexOf("Duplicate entry") >= 0) {
                let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
                  .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                  .setTitle("Existing Subscription Found!")
                  .setDescription("Nothing has been saved.")
                  .setFooter("You can type 'view', 'presets', 'add', 'add adv', 'remove', or 'edit'.");
                Message.channel.send(subscription_success).then(BotMsg => {
                  return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
                });
              } else {
                WDR.Console.error(WDR, "[cmd/sub/raid/create.js] Error Inserting Subscription.", [query, error]);
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                  timeout: 10000
                }));
              }
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                .setTitle(create.name + " Raid Subscription Complete!")
                .setDescription("Saved to the Database.")
                .setFooter("You can type 'view', 'presets', 'add', or 'remove'.");
              Message.channel.send(subscription_success).then(msg => {
                return Functions.OptionCollect(WDR, Functions, "complete", Message, msg, Member);
              });
            }
          }
        );
      }
    }
  );
}