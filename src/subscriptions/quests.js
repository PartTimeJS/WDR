module.exports = async (WDR, Sighting) => {

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
        reward = '${Quest.pokemon_id}'
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
        WDR.Console.error(WDR, "[commands/pokemon.js] Error Querying Subscriptions.", [query, error]);
      } else if (matching && matching[0]) {

        Quest.sprite = WDR.Get_Sprite(WDR, Quest);

        if (WDR.Config.QUEST_PREGEN_TILES != "DISABLED") {
          Quest.body = await WDR.Generate_Tile(WDR, Quest, "pokemon", Quest.latitude, Quest.longitude, Quest.sprite);
          Quest.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + Quest.body;
        }

        for (let m = 0, mlen = matching.length; m < mlen; m++) {
          let User = matching[m];

          if (matching[0] == "areas" || matching[0].geotype == "city") {
            let defGeo = (User.areas.indexOf(Quest.area.default) >= 0);
            let mainGeo = (User.areas.indexOf(Quest.area.main) >= 0);
            let subGeo = (User.areas.indexOf(Quest.area.sub) >= 0);
            if (defGeo || mainGeo || subGeo) {
              Send_Subscription(WDR, Quest, User);
            }

          } else if (User.geotype == "location") {
            let distance = WDR.Distance.between({
              lat: Sighting.latitude,
              lon: Sighting.longitude
            }, {
              lat: User.location.coords.split(",")[0],
              lon: User.location.coords.split(",")[1]
            });
            let loc_dist = WDR.Distance(User.location.radius + " km");
            if (loc_dist > distance) {
              Send_Subscription(WDR, Quest, User);
            }
          }
        }
      }
    }
  );

  // END
  return;
}

async function Send_Subscription(WDR, Quest, User) {

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
    match.Embed = Embed_Config(WDR, Quest);

    let DB_Date = moment(Quest.Time_Now).format("MM/DD/YYYY");
    DB_Date = moment(DB_Date + " " + User.quest_time, "MM/DD/YYYY H:mm").valueOf();

    let Quest_Object = JSON.stringify(Quest);
    let Embed = JSON.stringify(match.Embed);

    let query = `
      INSERT INTO
        quest_alerts (
            user_id,
            user_name,
            guild_id,
            bot,
            area,
            alert,
            quest_time,
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