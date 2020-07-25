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
  // PULL THE USER"S SUBSCRITIONS FROM THE USER TABLE
  WDR.wdrDB.query(
    query,
    async function(error, user, fields) {

      // RETRIEVE AREA NAME FROM USER
      let sub = await Functions.DetailCollect(WDR, Functions, "Remove", Member, Message, null, "Names are not case-sensitive. The Check denotes you are already subscribed to that Area.", user[0].geofence, AreaArray);
      if (sub.toLowerCase() == "cancel") {
        return Message.reply("Subscription cancelled. Type `" + prefix + "area` to restart.").then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      } else if (sub == "time") {
        return Message.reply("Your subscription has timed out.").then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      }

      // DEFINED VARIABLES
      let areas = user[0].geofence.split(",");
      let area_index = areas.indexOf(sub);

      // CHECK IF USER IS ALREADY SUBSCRIBED TO THE AREA OR NOT AND ADD
      if (sub == "all") {
        areas = "None";
      } else if (area_index < 0) {
        return Message.reply("You are not subscribed to that Area. Please try again.").then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      } else {
        areas.splice(area_index, 1);
      }

      if (areas.length == 0) {
        areas = "None";
      } else {
        areas = areas.toString();
      }

      // UPDATE THE USER"S RECORD
      let update = `
        UPDATE
            wdr_users a
        INNER JOIN
            wdr_subscriptions b ON(a.user_id = b.user_id)
        SET
            a.geofence = '${areas}',
            b.geofence = '${areas}'
        WHERE
            a.user_id = ${Member.id}
              AND
            a.guild_id = ${Message.guild.id}
              AND
            b.user_id = ${Member.id}
      `;
      WDR.wdrDB.query(
        update,
        function(error, user, fields) {
          if (error) {
            WDR.Console.error(WDR, "[subs/poke/create.js] Error Updating User Geofences.", [update, error]);
            return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
              timeout: 10000
            }));
          } else {
            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
              .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
              .setTitle("**" + sub + "** Area Removed!")
              .setFooter("Saved to the " + WDR.config.BOT_NAME + " Database.");
            return Message.channel.send(subscription_success).then(BotMsg => {
              return Functions.OptionCollect(WDR, Functions, "remove", Message, BotMsg, Member, AreaArray);
            });
          }
        }
      );
    }
  );
}