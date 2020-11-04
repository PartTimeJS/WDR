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
    async function(error, user) {
      if (error) {
        WDR.Console.error(WDR, "[cmd/sub/loc/create.js] Error Fetching Subscriptions to Create Subscription.", [query, error]);
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

        let locations;
        if (!user.locations){
          let null_locations = new WDR.DiscordJS.MessageEmbed()
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle("You do not have any Locations.")
            .setFooter("You can type 'set', 'create', 'view', 'edit', or 'remove'.");
          Message.channel.send(null_locations).catch(console.error).then(BotMsg => {
            return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
          });
          
        } else {
          locations = Object.keys(user.locations).map(i => user.locations[i]);
        }

        if (locations.length > 0) {
          let set = await Functions.DetailCollect(WDR, Functions, "Set", Member, Message, user.locations, "Please use one word to describe this location without punctuation.", null);
          let active_location = locations[set];

          console.log(active_location)

          let sub_loc = `
            UPDATE
                wdr_subscriptions
            SET
                geotype = 'location',
                location = '${JSON.stringify(active_location)}'
            WHERE
                user_id = ${Member.id}
                  AND
                geotype != 'city';
          ;`;
          WDR.wdrDB.query(
            sub_loc,
            function(error, user) {
              if (error) {
                WDR.Console.error(WDR, "[subs/loc/set.js] Error Updating User Location.", [set_loc, error]);
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                  timeout: 10000
                }));
              }
            }
          );

          let user_loc = `
            UPDATE
                wdr_users
            SET
                geotype = 'location',
                location = '${JSON.stringify(active_location)}'
            WHERE
                user_id = ${Member.id}
                  AND
                geotype != 'city';
          ;`;
          WDR.wdrDB.query(
            user_loc,
            function(error, user) {
              if (error) {
                WDR.Console.error(WDR, "[subs/loc/set.js] Error Updating User Location.", [set_loc, error]);
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                  timeout: 10000
                }));
              } else {
                let no_locations = new WDR.DiscordJS.MessageEmbed()
                  .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                  .setTitle("Your Location has been set to " + active_location.name + ".")
                  .setFooter("You can type 'set', 'create', 'view', 'edit', or 'remove'.");
                Message.channel.send(no_locations).catch(console.error).then(BotMsg => {
                  return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
                });
              }
            }
          );

        } else {
          let no_locations = new WDR.DiscordJS.MessageEmbed()
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle("You do not have any Locations.")
            .setFooter("You can type 'set', 'create', 'view', 'edit', or 'remove'.");
          Message.channel.send(no_locations).catch(console.error).then(BotMsg => {
            return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
          });
        }
      }
    }
  );
}