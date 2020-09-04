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
      if (error) {
        WDR.Console.error(WDR, "[sub/loc/view.js] Error Fetching User to View Locations.", [query, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else {

        user = user[0];
        user.location = JSON.parse(user.location);
        user.locations = JSON.parse(user.locations);

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

            let number = await Functions.DetailCollect(WDR, Functions, "Remove", Member, Message, location_list, "Type the corressponding # of the subscription you would like to remove -OR- type \'all\'");

            delete user.locations[locations[number].name];

            if (user.location.toString() == user.locations[locations[number].name].toString()) {

              Message.reply("WARNING: You are deleting your actie location. You will need to set a new location to receive location alerts.").then(m => m.delete({
                timeout: 10000
              }));

              WDR.wdrDB.query(`
                UPDATE
                    wdr_users
                SET
                    location = NULL
                WHERE
                    user_id = ${Member.id};
              `);
              WDR.wdrDB.query(`
                UPDATE
                    wdr_subsriptions
                SET
                    location = NULL
                WHERE
                    user_id = ${Member.id};
              `);
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
                  WDR.Console.error(WDR, "[cmd/sub/loc/remove.js] Error Updating User Locations.", [update, error]);
                  return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                    timeout: 10000
                  }));
                } else {
                  let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle("**" + locations[number].name + "** Custom Location Removed!")
                    .setDescription("Saved to the Database.")
                    .setFooter("You can type 'set', 'view', 'create', 'edit', 'remove', or 'cancel'.");
                  Message.channel.send(subscription_success).then(BotMsg => {
                    Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member, AreaArray);
                  });
                }
              }
            );

          } else {
            let no_locations = new WDR.DiscordJS.MessageEmbed()
              .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
              .setTitle("You do not have any Locations.")
              .setFooter("You can type 'set', 'create', 'view', or 'remove'.");
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