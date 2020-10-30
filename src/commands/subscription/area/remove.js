module.exports = async (WDR, Functions, message, Member, AreaArray) => {
  let query = `
    SELECT
        *
    FROM
        wdr_users
    WHERE
        user_id = ${Member.id}
          AND
        guild_id = ${message.guild.id};
  `;
  WDR.wdrDB.query(
    query,
    async function(error, user, fields) {

      let sub = await Functions.DetailCollect(WDR, Functions, "Remove", Member, message, null, "Names are not case-sensitive. The Check denotes you are already subscribed to that Area. Type `reset` to revert to your areas to default.", user[0].areas, AreaArray);
      if (sub.toLowerCase() == "cancel") {
        return message.reply("Subscription cancelled. Type `" + prefix + "area` to restart.").then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      } else if (sub == "time") {
        return message.reply("Your subscription has timed out.").then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      }

      let areas = user[0].areas.split(",");
      let area_index = areas.indexOf(sub);

      if (sub == "all") {
        areas = [];
      } else if (sub == "reset") {
        areas = message.discord.name;
      } else {
        areas.splice(area_index, 1);
      }

      if (areas.length === 0) {
        areas = "None";
      } else {
        areas = areas.toString();
      }

      WDR.wdrDB.query(`
        UPDATE
            wdr_subscriptions
        SET
            areas = '${areas}'
        WHERE
            user_id = ${Member.id}
      ;`);

      let update = `
        UPDATE
            wdr_users
        SET
            areas = '${areas}'
        WHERE
            user_id = ${Member.id}
        ;`;
      WDR.wdrDB.query(
        update,
        function(error, user, fields) {
          if (error) {
            WDR.Console.error(WDR, "[subs/poke/create.js] Error Updating User Geofences.", [update, error]);
            return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
              timeout: 10000
            }));
          } else {
            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
              .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
              .setTitle("**" + sub + "** Area Removed!")
              .setFooter("Saved to the Database.");
            return message.channel.send(subscription_success).then(BotMsg => {
              return Functions.OptionCollect(WDR, Functions, "remove", message, BotMsg, Member, AreaArray);
            });
          }
        }
      );
    }
  );
}