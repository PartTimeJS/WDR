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
        WDR.Console.error(WDR, "[cmd/sub/loc/create.js] Error Fetching Subscriptions to Create Subscription.", [query, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else {

        if (JSON.stringify(Member.db.locations) != JSON.stringify(user.locations)) {
          Member.db.locations = user.locations;
        }

        if (!user.locations) {
          user.locations = {};
        } else if (Object.keys(user.locations).map(i => user.locations[i]).length >= 10) {
          let too_many = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle("You have too many Custom Locations! (Maximum: 10)")
            .setDescription("Please delete one before creating another.")
            .setFooter("You can type 'set', 'view', 'create', 'modify', 'delete' or 'cancel'.");
          return Message.reply(too_many).then(BotMsg => {
            return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
          });
        }

        let create = {};

        create.name = await Functions.DetailCollect(WDR, Functions, "Name", Member, Message, user.locations, "Please use one word to describe this location without punctuation.", create);

        create.coords = await Functions.DetailCollect(WDR, Functions, "Coords", Member, Message, null, "Coordiantes must be separated by a comma with no spaces.", create);

        create.radius = await Functions.DetailCollect(WDR, Functions, "Radius", Member, Message, null, "Radius must be a whole number from 1 to 5.", create);

        create.active = await Functions.DetailCollect(WDR, Functions, "Active", Member, Message, null, "Type 'Yes' or 'No.'", create);

        let confirm = await Functions.DetailCollect(WDR, Functions, "Confirm", Member, Message, null, "Type 'Yes' to confirm or 'No' to cancel.", create);
        if (confirm == false) {
          return;
        }

        if (create.active == true) {
          let subs_active = `
            UPDATE
                wdr_subscriptions
            SET
                geotype = 'location',
                location = '${(create.coords + ";" + create.radius)}'
            WHERE
                user_id = ${Member.id}
                  AND
                geotype != 'city'
          ;`;
          WDR.wdrDB.query(
            subs_active,
            function(error, user, fields) {
              if (error) {
                WDR.Console.error(WDR, "[cmd/sub/loc/create.js] Error Updating wdr_subscriptions Active Location.", [update, error]);
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
                geotype = 'location',
                location = '${(create.coords + ";" + create.radius)}'
            WHERE
                user_id = ${Member.id}
          ;`;
          WDR.wdrDB.query(
            user_active,
            function(error, user, fields) {
              if (error) {
                WDR.Console.error(WDR, "[cmd/sub/loc/create.js] Error Updating wdr_users Active Location.", [update, error]);
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                  timeout: 10000
                }));
              }
            }
          );
        }

        user.locations[create.name] = create;

        let jsonString = JSON.stringify(user.locations);

        let update = `
          UPDATE
              wdr_users
          SET
              locations = '${jsonString}'
          WHERE
              user_id = ${Member.id}
                AND
              guild_id = ${Message.guild.id};
        `;
        WDR.wdrDB.query(
          update,
          function(error, user, fields) {
            if (error) {
              WDR.Console.error(WDR, "[cmd/sub/loc/create.js] Error Updating User Locations.", [update, error]);
              return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                timeout: 10000
              }));
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                .setTitle("**" + create.name + "** Custom Location Added!")
                .setDescription("Saved to the Database.")
                .setFooter("You can type 'set', 'view', 'create', 'modify', 'delete', or 'cancel'.");
              return Message.channel.send(subscription_success).then(BotMsg => {
                return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member, AreaArray);
              });
            }
          }
        );
      }
    }
  );
}