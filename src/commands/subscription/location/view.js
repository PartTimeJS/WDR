module.exports = async (WDR, Functions, Message, Member, AreaArray) => {
  let query = `
    SELECT
        *
    FROM
        wdr_users
    WHERE
        user_id = ${Member.id};
  `;
  WDR.wdrDB.query(
    query,
    function(error, user, fields) {
      let User = user[0];
      if (error) {
        WDR.Console.error(WDR, "[sub/loc/view.js] Error Fetching User to View Locations.", [query, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else {

        if (JSON.stringify(Member.db.locations) != JSON.stringify(User.locations)) {
          Member.db.locations = User.locations;
        }

        let location_list = "";
        if (User.locations) {
          User.locations = JSON.parse(User.locations);
          let locations = Object.keys(User.locations).map(i => User.locations[i]);
          if (locations.length > 0) {
            locations.forEach((location, i) => {
              if (location.name == User.location.name) {
                location_list += "**" + (i + 1) + " - " + location.name + " [ACTIVE]**\n" +
                  "　Radius: `" + location.radius + "` km(s)\n";
              } else {
                location_list += "**" + (i + 1) + " - " + location.name + "**\n" +
                  "　Radius: `" + location.radius + "` km(s)\n";
              }
            });
            let area_subs = new WDR.DiscordJS.MessageEmbed()
              .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
              .setTitle("Your Locations:")
              .setDescription(location_list)
              .setFooter("You can type 'set', 'create', 'view', 'edit', or 'remove'.");
            Message.channel.send(area_subs).catch(console.error).then(BotMsg => {
              Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
            });
          } else {
            let length_fail = new WDR.DiscordJS.MessageEmbed()
              .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
              .setTitle("You do not have any Locations.")
              .setFooter("You can type 'set', 'create', 'view', 'edit', or 'remove'.");
            Message.reply(length_fail).catch(console.error).then(BotMsg => {
              Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
            });
          }
        } else {
          let no_locations = new WDR.DiscordJS.MessageEmbed()
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle("You do not have any Locations.")
            .setFooter("You can type 'set', 'create', 'view', 'edit', or 'remove'.");
          Message.reply(no_locations).catch(console.error).then(BotMsg => {
            Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
          });
        }
      }
    }
  );
}