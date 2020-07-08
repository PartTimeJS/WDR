const moment = require("moment");

module.exports = async (WDR, Target, Quest) => {
  let Q = Quest;
  let Embed_Config = require(WDR.dir + "/configs/embeds/" + Q.Embed);

  // CHECK IF THE TARGET IS A USER
  Q.Member = WDR.Bot.guilds.cache.get(Q.Discord.id).members.cache.get(Target.user_id);

  // VARIABLES
  Q.name = Q.pokestop_name;
  Q.reward = Q.quest_reward;

  // GET LOCATION INFO
  Q.lat = Q.latitude;
  Q.lon = Q.longitude;
  Q.area = Q.Area.Embed;
  Q.url = Q.pokestop_url;
  Q.map_url = WDR.Config.FRONTEND_URL;

  // MAP LINK PROVIDERS
  Q.google = "[Google Maps](https://www.google.com/maps?q=" + Q.latitude + "," + Q.longitude + ")";
  Q.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + Q.latitude + "," + Q.longitude + "&z=10&t=s&dirflg=d)";
  Q.waze = "[Waze](https://www.waze.com/ul?ll=" + Q.latitude + "," + Q.longitude + "&navigate=yes)";
  Q.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + Q.latitude + "&lon=" + Q.longitude + "&zoom=15)";
  Q.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + Q.latitude + "/" + Q.longitude + "/15)";

  Q.reward_sprite = WDR.Get_Sprite(WDR, Quest);

  Q.marker_latitude = Q.latitude + .0004;

  Q.body = await WDR.Generate_Tile(WDR, "quests", Q.marker_latitude, Q.lon, Q.sprite);
  Q.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + Q.body;

  // DECLARE VARIABLES
  Q.time = WDR.Time(null, "quest", Q.Timezone);

  // GET EMBED COLOR BASED ON QUEST DIFFICULTY
  switch (true) {
    case Q.template.indexOf("easy") >= 0:
      Q.color = "00ff00";
      break;
    case Q.template.indexOf("moderate") >= 0:
      Q.color = "ffff00";
      break;
    case Q.template.indexOf("hard") >= 0:
      Q.color = "ff0000";
      break;
    default:
      Q.color = "00ccff";
  }

  // CREATE QUEST EMBED
  if (!Q.sprite) {
    Q.sprite = Q.url;
  }
  Q.Embed = Embed_Config(WDR, Quest);

  // IF MEMBER SEND INSERT INTO DB
  if (Q.Member) {
    // CHECK THE TIME VERSUS THE USERS SET SUBSCRIPTION TIME
    Q.Todays_Date = moment(Q.Time_Now).format("MM/DD/YYYY");
    Q.DB_Date = moment(Q.Todays_Date + " " + Target.alert_time, "MM/DD/YYYY H:mm").valueOf();

    // STRINGIFY THE WEBHOOK FOR DB INSTER
    let quest_object = JSON.stringify(Quest);
    Q.Embed = JSON.stringify(Q.Embed);

    // SAVE THE ALERT TO THE ALERT TABLE FOR FUTURE DELIVERY
    returnWDR.wdrDBquery(`INSERT INTO quest_alerts (user_id, user_name, guild_id, bot, area, alert, alert_time, embed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Target.user_id, Target.user_name, quest_object, Q.Embed, Q.Area.Embed, Target.bot, Q.DB_Date, Q.Discord.id],
      function(error, alert, fields) {
        if (error) {
          console.error("[" + WDR.Time(null, "stamp") + "] UNABLE TO ADD ALERT TO quest_alerts", error);
        } else if (WDR.Debug.Quests == "ENABLED" && WDR.Debug.Subscriptions == "ENABLED") {
          console.log(WDR.Color.pink + "[EMBEDS] [" + WDR.Time(null, "stamp") + "] [quests.js] [SUBSCRIPTIONS] Stored a " + Q.quest_reward + " Quest Alert for " + Target.user_name + "." + WDR.Color.reset);
        }
      });
  } else {
    // SEND EMBED TO CHANNEL
    return WDR.Send_Embed(WDR, Q.Embed, Target.id);
  }
}