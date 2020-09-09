module.exports = async (WDR, QUEST) => {

  let query = `
    SELECT
        *
    FROM
        wdr_subscriptions
    WHERE
        status = 1
      AND
        sub_type = 'quest'
      AND (
        reward = '${WDR.Master.Pokemon[Quest.pokemon_id].name}'
          OR
        reward = '${Quest.simple_reward}'
          OR
        reward = '${Quest.full_reward}'
      );
    `;

  WDR.wdrDB.query(
    query,
    async function(error, matching, fields) {
      if (error) {
        WDR.Console.error(WDR, "[src/subs/quests.js] Error Querying Subscriptions.", [query, error]);
      } else if (matching && matching.length > 0) {

        QUEST.sprite = WDR.Get_Sprite(WDR, QUEST);

        if (WDR.Config.QUEST_PREGEN_TILES != "DISABLED") {
          QUEST.body = await WDR.Generate_Tile(WDR, QUEST, "pokemon", QUEST.latitude, QUEST.longitude, QUEST.sprite);
          QUEST.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + QUEST.body;
        }

        for (let m = 0, mlen = matching.length; m < mlen; m++) {

          let User = matching[m];

          User.location = JSON.parse(User.location);

          let authorized = await WDR.Authorize(WDR, discord.id, User.user_id, discord.allowed_roles);
          if (authorized) {
            let match = {};

            if (User.geotype == "city") {
              if (User.guild_name == QUEST.area.default) {
                match.embed = matching[0].embed ? matching[0].embed : "pokemon_iv.js";
                if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                  WDR.Console.log(WDR, "[DEBUG] [src/subs/quests.js] " + QUEST.encounter_id + " | Sent city sub to " + User.user_name + ".");
                }
                Send_Subscription(WDR, match, QUEST, User);
              } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                WDR.Console.info(WDR, "[DEBUG] [src/subs/quests.js] " + QUEST.encounter_id + " | User: " + User.user_name + " | Failed City Geofence. Wanted: `" + User.guild_name + "` Saw: `" + QUEST.area.default+"`")
              }

            } else if (User.geotype == "areas") {
              let defGeo = (User.areas.indexOf(QUEST.area.default) >= 0);
              let mainGeo = (User.areas.indexOf(QUEST.area.main) >= 0);
              let subGeo = (User.areas.indexOf(QUEST.area.sub) >= 0);
              if (defGeo || mainGeo || subGeo) {
                match.embed = matching[0].embed ? matching[0].embed : "pokemon_iv.js";
                if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                  WDR.Console.log(WDR, "[DEBUG] [src/subs/quests.js] " + QUEST.encounter_id + " | Sent area sub to " + User.user_name + ".");
                }
                Send_Subscription(WDR, match, QUEST, User);
              } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                WDR.Console.info(WDR, "[DEBUG] [src/subs/quests.js] " + QUEST.encounter_id + " | User: " + User.user_name + " | Failed Area Geofence.")
              }

            } else if (User.geotype == "location") {
              let distance = WDR.Distance.between({
                lat: QUEST.latitude,
                lon: QUEST.longitude
              }, {
                lat: User.location.coords.split(",")[0],
                lon: User.location.coords.split(",")[1]
              });
              let loc_dist = WDR.Distance(parseInt(User.location.radius) + " km");
              if (loc_dist > distance) {
                match.embed = matching[0].embed ? matching[0].embed : "pokemon_iv.js";
                if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                  WDR.Console.log(WDR, "[DEBUG] [src/subs/quests.js] " + QUEST.encounter_id + " | Sent location sub to " + User.user_name + ".");
                }
                Send_Subscription(WDR, match, QUEST, User);
              }
            } else {
              WDR.Console.error(WDR, "[DEBUG] [src/subs/quests.js] User: " + User.user_name + " | User geotype has a bad value.", User);
            }
          } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
            WDR.Console.info(WDR, "[DEBUG] [src/subs/quests.js] " + QUEST.encounter_id + " | " + User.user_name + " did NOT pass authorization for " + discord.name + " (" + discord.id + ").");
          }
        }
      }
    }
  );

  // END
  return;
}

async function Send_Subscription(WDR, Quest, User) {

  await WDR.Rate_Limit(WDR, User);

  let Embed_Config = require(WDR.Dir + "/configs/embeds/" + Quest.Embed);

  match.member = WDR.Bot.guilds.cache.get(Quest.discord.id).members.fetch(User.user_id);

  if (match.member) {

    match.name = Quest.pokestop_name;

    match.reward = Quest.quest_reward;
    match.sprite = Quest.sprite;

    match.lat = Quest.latitude;
    match.lon = Quest.longitude;
    match.area = Quest.area.embed;

    match.url = Quest.pokestop_url;
    match.map_url = WDR.Config.FRONTEND_URL;

    match.google = "[Google Maps](https://www.google.com/maps?q=" + Quest.latitude + "," + Quest.longitude + ")";
    match.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + Quest.latitude + "," + Quest.longitude + "&z=10&t=s&dirflg=d)";
    match.waze = "[Waze](https://www.waze.com/ul?ll=" + Quest.latitude + "," + Quest.longitude + "&navigate=yes)";
    match.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + Quest.latitude + "&lon=" + Quest.longitude + "&zoom=15)";
    match.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + Quest.latitude + "/" + Quest.longitude + "/15)";

    match.marker_latitude = Quest.latitude + .0004;

    match.body = await WDR.Generate_Tile(WDR, Q, "quests", match.marker_latitude, match.lon, match.reward_sprite);
    match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;

    match.time = WDR.Time(null, "quest", Quest.Timezone);

    switch (true) {
      case Quest.template.indexOf("easy") >= 0:
        match.color = "00ff00";
        break;
      case Quest.template.indexOf("moderate") >= 0:
        match.color = "ffff00";
        break;
      case Quest.template.indexOf("hard") >= 0:
        match.color = "ff0000";
        break;
      default:
        match.color = "00ccff";
    }

    if (!match.sprite) {
      match.sprite = match.url;
    }
    match.embed = Embed_Config(WDR, match);

    let DB_Date = moment(Quest.Time_Now).format("MM/DD/YYYY");
    DB_Date = moment(DB_Date + " " + User.quest_time, "MM/DD/YYYY H:mm").valueOf();

    let Quest_Object = JSON.stringify(Quest);
    let Embed = JSON.stringify(match.embed);

    let query = `
      INSERT INTO
        wdr_quest_queue (
            user_id,
            user_name,
            guild_id,
            bot,
            area,
            alert,
            alert_time,
            embed
        )
      VALUES
        (
            ${User.user_id},
            '${User.user_name}',
            '${Quest_Object}',
            '${Embed}',
            '${match.area.embed}',
            ${User.bot},
            '${DB_Date}',
            '${Quest.discord.id}'
        )
      ;`;
    WDR.wdrDB.query(
      query,
      function(error, alert, fields) {
        if (error) {
          WDR.Console.error(WDR, "[" + WDR.Time(null, "stamp") + "] UNABLE TO ADD ALERT TO quest_alerts", [query, error]);
        }
      }
    );
  }

  // END
  return;
}