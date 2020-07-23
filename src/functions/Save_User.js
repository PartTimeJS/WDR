const moment = require("moment-timezone");
const GeoTz = require("geo-tz");

// SAVE A USER IN THE USER TABLE
module.exports = (WDR, message, server) => {
  return new Promise(async resolve => {
    WDR.wdrDB.query(`
      SELECT
          *
      FROM
          wdr_info`,
      function(error, info, fields) {
        let next_bot = info[0].next_bot,
          split = WDR.Config.QUEST.Default_Delivery.split(":");
        if (next_bot == WDR.Bot.Array.length - 1) {
          next_bot = 0;
        } else {
          next_bot++;
        }
        let quest_time = moment(),
          timezone = GeoTz(server.geofence[0][0][1], server.geofence[0][0][0]);
        quest_time = moment.tz(quest_time, timezone[0]).set({
          hour: split[0],
          minute: split[1],
          second: 0,
          millisecond: 0
        });
        quest_time = moment.tz(quest_time, WDR.Config.TIMEZONE).format("HH:mm");
        user_name = message.member.user.username.replace(/[\W]+/g, "");
        WDR.wdrDB.query(
          `INSERT INTO
            wdr_users (
              user_id,
              user_name,
              guild_id,
              guild_name,
              bot,
              geofence,
              alert_time
            )
          VALUES (
              ${message.member.id},
              '${user_name}',
              ${message.guild.id},
              '${server.name}',
              ${next_bot},
              '${server.name}',
              '${quest_time}'
            )`,
          async function(error, user, fields) {
            if (error) {
              return WDR.Console.error(WDR, "[Save_User] [" + WDR.Time(null, "stamp") + "] [bot.js] UNABLE TO ADD USER TO wdr_users TABLE", error);
            } else {
              WDR.wdrDB.query(`UPDATE wdr_info SET next_bot = ${next_bot};`);
              WDR.Console.info("Save_User.js] Added " + message.member.user.tag + " to the wdr_users Table.");
              return;
            }
          }
        );
      }
    );
    return;
  });
}