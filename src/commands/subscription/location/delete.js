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

      if (JSON.stringify(Member.db.locations) != JSON.stringify(user.locations)) {
        Member.db.locations = user.locations;
      }

      // RETRIEVE AREA NAME FROM USER
      let sub = await Functions.DetailCollect(WDR, Functions, "Remove", Member, Message, null, "Names are not case-sensitive. The Check denotes you are already subscribed to that Area. Type `reset` to revert to your areas to default.", user[0].areas, AreaArray);
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
      let areas = user[0].areas.split(",");
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

      let subs_update = `
        UPDATE
            wdr_subscriptions
        SET
            areas = '${areas}'
        WHERE
            user_id = ${Member.id}
              AND
            geotype != 'city'
      ;`;
      WDR.wdrDB.query(
        subs_update,
        function(error, user, fields) {
          if (error) {
            WDR.Console.error(WDR, "[subs/poke/create.js] Error Updating Subscriptions' Geofences.", [update, error]);
            return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
              timeout: 10000
            }));
          }
        }
      );

      let user_update = `
        UPDATE
            wdr_users
        SET
            areas = '${areas}'
        WHERE
            user_id = ${Member.id}
      ;`;
      WDR.wdrDB.query(
        user_update,
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