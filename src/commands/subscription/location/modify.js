module.exports = async (WDR, Functions, Message, Member, AreaArray) => {
  let query = `
    SELECT
        *
    FROM
        wdr_users
    WHERE
        user_id = ${Member.id}
          AND
        guild_id = ${Message.guild.id};
  `;
  WDR.wdrDB.query(
    query,
    async function(error, user, fields) {
      user = user[0];
      if (error) {
        WDR.Console.error(WDR, "[sub/loc/view.js] Error Fetching User to View Locations.", [query, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else {

        if (JSON.stringify(Member.db.locations) != JSON.stringify(user.locations)) {
          Member.db.locations = user.locations;
        }

        let location_list = "";
        if (user.locations) {
          let locations = Object.keys(user.locations).map(i => user.locations[i]);
          if (locations.length > 0) {
            locations.forEach((location, i) => {
              location_list += "**" + (i + 1) + " - " + location.name + "**\n" +
                "　Radius: `" + location.radius + "` km(s)\n";
            });

            let number = await Functions.DetailCollect(WDR, Functions, "Modify", Member, Message, location_list, "Type the corressponding # of the subscription you would like to remove -OR- type \'all\'");

            let modify = user.locations[locations[number].name];

            modify.radius = await Functions.DetailCollect(WDR, Functions, "Radius", Member, Message, null, "Please respond with 'Next' or a whole number from 1 to 5.", modify);
            modify.radius = parseInt(modify.radius);

            let active = await Functions.DetailCollect(WDR, Functions, "Active", Member, Message, null, "Type 'Yes' or 'No.'", modify);

            let confirm = await Functions.DetailCollect(WDR, Functions, "Confirm", Member, Message, null, "Type 'Yes' to confirm or 'No' to cancel.", modify);
            if (confirm == false) {
              return;
            }

            user.locations[locations[number].name] = modify;

            if (active == true) {
              let subs_active = `
                UPDATE
                    wdr_subscriptions
                SET
                    location = '${JSON.stringify(modify)}'
                WHERE
                    user_id = ${Member.id}
              ;`;
              WDR.wdrDB.query(
                subs_active,
                function(error, user, fields) {
                  if (error) {
                    WDR.Console.error(WDR, "[cmd/sub/loc/modify.js] Error Updating wdr_subscriptions Active Location.", [update, error]);
                    return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                      timeout: 10000
                    }));
                  }
                }
              );
              let user_active = `
                UPDATE
                    wdr_users
                SET
                    location = '${JSON.stringify(modify)}'
                WHERE
                    user_id = ${Member.id}
              ;`;
              WDR.wdrDB.query(
                user_active,
                function(error, user, fields) {
                  if (error) {
                    WDR.Console.error(WDR, "[cmd/sub/loc/modify.js] Error Updating wdr_users Active Location.", [update, error]);
                    return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                      timeout: 10000
                    }));
                  }
                }
              );
            }

            let update = `
              UPDATE
                  wdr_users
              SET
                  locations = '${JSON.stringify(user.locations)}'
              WHERE
                  user_id = ${Member.id}
            ;`;

            WDR.wdrDB.query(
              update,
              function(error, user, fields) {
                if (error) {
                  WDR.Console.error(WDR, "[cmd/sub/loc/modify.js] Error Updating User Locations.", [update, error]);
                  return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                    timeout: 10000
                  }));
                } else {
                  let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle("**" + locations[number].name + "** Custom Location Removed!")
                    .setDescription("Saved to the Database.")
                    .setFooter("You can type 'set', 'view', 'edit', 'remove', or 'cancel'.");
                  Message.channel.send(subscription_success).then(BotMsg => {
                    Functions.OptionCollect(WDR, Functions, "modify", Message, BotMsg, Member, AreaArray);
                  });
                }
              }
            );

          } else {
            let no_locations = new WDR.DiscordJS.MessageEmbed()
              .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
              .setTitle("You do not have any Locations.")
              .setFooter("You can type 'set', 'edit', 'view', or 'remove'.");
            Message.channel.send(no_locations).catch(console.error).then(BotMsg => {
              Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
            });
          }

          // END
          return;
        }
      }
    }
  );
}