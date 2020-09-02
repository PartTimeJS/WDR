module.exports = async (WDR, RAID) => {

  let discord = RAID.discord;

  let query_id = "";
  if (RAID.pokemon_id < 1) {
    query_id = -1;
  } else {
    query_id = RAID.pokemon_id;
  }

  let query = `
    SELECT
        *
    FROM
        wdr_subscriptions
    WHERE
        status = 1
      AND
        sub_type = 'raid'
      AND (
        pokemon_id = 0
          OR
        pokemon_id = ${query_id}
      )
      AND (
        max_lvl = 0
          OR
        max_lvl >= ${RAID.level}
      )
      AND (
        min_lvl = 0
          OR
        min_lvl <= ${RAID.level}
      )
      AND (
        gym_id = '0'
          OR
        gym_id = '${RAID.gym_id}'
      );
    `;

  WDR.wdrDB.query(
    query,
    async function(error, matching, fields) {
      if (error) {
        WDR.Console.error(WDR, "[commands/pokemon.js] Error Querying Subscriptions.", [query, error]);
      } else if (matching && matching[0]) {

        for (let m = 0, mlen = matching.length; m < mlen; m++) {

          let User = matching[m];

          User.location = JSON.parse(User.location);

          let member = await WDR.Bot.guilds.cache.get(discord.id).members.fetch(User.user_id);
          if (member) {

            let memberRoles = member.roles.cache.map(r => r.id);

            let authorized = await WDR.Check_Roles(memberRoles, RAID.discord.allowed_roles);
            if (authorized) {

              if (User.geotype == "city") {
                if (User.guild_name == RAID.area.default) {
                  if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                    WDR.Console.log(WDR, "[DEBUG] [src/subs/raids.js] " + RAID.gym_id + " | Sent city sub to " + User.user_name + ".");
                  }
                  Send_Subscription(WDR, RAID, User);
                } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                  WDR.Console.info(WDR, "[DEBUG] [src/subs/raids.js] " + RAID.gym_id + " | User: " + User.user_name + " | Failed City Geofence. Wanted: `" + User.guild_name + "` Saw: `" + RAID.area.default+"`")
                }

              } else if (User.geotype == "areas") {
                let defGeo = (User.areas.indexOf(RAID.area.default) >= 0);
                let mainGeo = (User.areas.indexOf(RAID.area.main) >= 0);
                let subGeo = (User.areas.indexOf(RAID.area.sub) >= 0);
                if (defGeo || mainGeo || subGeo) {
                  if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                    WDR.Console.log(WDR, "[DEBUG] [src/subs/raids.js] " + RAID.gym_id + " | Sent area sub to " + User.user_name + ".");
                  }
                  Send_Subscription(WDR, RAID, User);
                } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                  WDR.Console.info(WDR, "[DEBUG] [src/subs/raids.js] " + RAID.gym_id + " | User: " + User.user_name + " | Failed Area Geofence.")
                }

              } else if (User.geotype == "location") {
                let distance = WDR.Distance.between({
                  lat: RAID.latitude,
                  lon: RAID.longitude
                }, {
                  lat: User.location.coords.split(",")[0],
                  lon: User.location.coords.split(",")[1]
                });
                let loc_dist = WDR.Distance(parseInt(User.location.radius) + " km");
                if (loc_dist > distance) {
                  if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                    WDR.Console.log(WDR, "[DEBUG] [src/subs/raids.js] " + RAID.gym_id + " | Sent location sub to " + User.user_name + ".");
                  }
                  Send_Subscription(WDR, RAID, User);
                }
              } else {
                WDR.Console.error(WDR, "[DEBUG] [src/subs/raids.js] User: " + User.user_name + " | User geotype has a bad value.", User);
              }
            } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
              WDR.Console.info(WDR, "[DEBUG] [src/subs/raids.js] " + RAID.gym_id + " | " + User.user_name + " IS NOT an Authorized User in " + discord.name + " (" + discord.id + ").");
              console.info("[DEBUG] [src/subs/raids.js] Allowed Roles: ", discord.allowed_roles);
              console.info("[DEBUG] [src/subs/raids.js] User Roles: ", memberRoles);
            }
          } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
            WDR.Console.info(WDR, "[DEBUG] [src/subs/raids.js] " + RAID.gym_id + " | " + User.user_name + " IS NOT a Member of " + discord.name + " (" + discord.id + ").", discord);
          }
        }
      }
    }
  );

  // END
  return;
}

async function Send_Subscription(WDR, RAID, User) {

  let match = {};

  let Embed_Config;
  if (RAID.cp > 0 || RAID.is_exclusive == true) {
    Embed_Config = require(WDR.Dir + "/configs/embeds/raid_boss.js");
  } else {
    Embed_Config = require(WDR.Dir + "/configs/embeds/raid_eggs.js");
  }

  match.id = RAID.gym_id;
  match.boss = RAID.pokemon_name ? RAID.pokemon_name : "Egg";
  match.lvl = RAID.level;
  match.gym = RAID.gym_name ? RAID.gym_name : "No Name";

  if (WDR.Gym_Notes && WDR.Gym_Notes[RAID.gym_id]) {
    match.notes = WDR.Gym_Notes[RAID.gym_id] ? WDR.Gym_Notes[RAID.gym_id].description : "";
  } else {
    match.notes = "";
  }

  match.exraid = RAID.is_exclusive ? "**EXRaid Invite Only**\n" : "";
  match.sponsor = (RAID.sponsor_id || RAID.ex_raid_eligible) ? WDR.Emotes.exPass + " Eligible" : "";

  match.lat = RAID.latitude;
  match.lon = RAID.longitude;
  match.area = RAID.area.embed;

  match.map_img = "";
  match.map_url = WDR.Config.FRONTEND_URL;

  match.google = "[Google Maps](https://www.google.com/maps?q=" + match.lat + "," + match.lon + ")";
  match.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + match.lat + "," + match.lon + "&z=10&t=s&dirflg=d)";
  match.waze = "[Waze](https://www.waze.com/ul?ll=" + match.lat + "," + match.lon + "&navigate=yes)";
  match.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + match.lat + "&lon=" + match.lon + "&zoom=15)";
  match.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + match.lat + "/" + match.lon + "/15)";

  if (RAID.team_id === 1) {
    match.team = WDR.Emotes.mystic + " Control";
  } else if (RAID.team_id === 2) {
    match.team = WDR.Emotes.valor + " Control";
  } else if (RAID.team_id === 3) {
    match.team = WDR.Emotes.instinct + " Control";
  } else if (RAID.team_id === 4) {
    match.team = "Your Mom's Control";
  } else {
    RAID.team_id = 0;
    match.team = "Uncontested Gym";
  }

  match.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/wdr/gyms/" + RAID.team_id + ".png";

  match.url = RAID.gym_url ? RAID.gym_url : "https://raw.githubusercontent.com/PartTimeJS/Assets/master/wdr/teams/" + RAID.team_id + ".png";

  if (RAID.level === 1 || RAID.level === 2) {
    match.color = "f358fb";
  } else if (RAID.level === 3 || RAID.level === 4) {
    match.color = "ffd300";
  } else if (RAID.level === 5) {
    match.color = "5b00de";
  } else if (RAID.level === 6) {
    match.color = "a53820";
  }

  match.hatch_time = WDR.Time(RAID.start, "1", RAID.Timezone);
  match.end_time = WDR.Time(RAID.end, "1", RAID.Timezone);
  match.hatch_mins = Math.floor((RAID.start - (RAID.Time_Now / 1000)) / 60);
  match.end_mins = Math.floor((RAID.end - (RAID.Time_Now / 1000)) / 60);

  match.marker_latitude = RAID.latitude + .0004;

  if (RAID.Type == "Egg") {
    match.sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/wdr/eggs/" + RAID.level + ".png";
  } else {
    match.sprite = WDR.Get_Sprite(WDR, RAID);
    match.form = RAID.form_name ? RAID.form_name : "";
    match.form = match.form == "[Normal]" ? "" : match.form;
    match.typing = await WDR.Get_Typing(WDR, RAID);
    match.type = match.typing.type;
    match.type_noemoji = match.typing.type_noemoji;
    match.weaknesses = match.typing.weaknesses;
    match.resistances = match.typing.resistances;
    match.reduced = match.typing.reduced;
    match.move_1_type = WDR.Emotes[WDR.Master.Moves[RAID.move_1].type.toLowerCase()];
    match.move_2_type = WDR.Emotes[WDR.Master.Moves[RAID.move_2].type.toLowerCase()];
    match.move_1_name = RAID.move_1_name;
    match.move_2_name = RAID.move_2_name;
    match.minCP = WDR.PvP.CalculateCP(WDR, RAID.pokemon_id, RAID.form_id, 10, 10, 10, 20);
    match.maxCP = WDR.PvP.CalculateCP(WDR, RAID.pokemon_id, RAID.form_id, 15, 15, 15, 20);
    match.minCP_boosted = WDR.PvP.CalculateCP(WDR, RAID.pokemon_id, RAID.form_id, 10, 10, 10, 25);
    match.maxCP_boosted = WDR.PvP.CalculateCP(WDR, RAID.pokemon_id, RAID.form_id, 15, 15, 15, 25);
  }

  if (WDR.Debug.Processing_Speed == "ENABLED") {
    let difference = Math.round((new Date().getTime() - RAID.WDR_Received) / 10) / 100;
    match.footer = "Latency: " + difference + "s";
  }

  if (WDR.Config.RAID_PREGEN_TILES != "DISABLED") {
    if (RAID.static_map) {
      match.body = RAID.body;
      match.static_map = RAID.static_map;
    } else {
      match.body = await WDR.Generate_Tile(WDR, RAID, "raids", match.marker_latitude, match.lon, match.embed_image, match.sprite);
      RAID.body = match.body;
      match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;
      RAID.static_map = match.static_map;
    }
  }

  match.embed = await Embed_Config(WDR, match);

  WDR.Send_DM(WDR, User.guild_id, User.user_id, match.embed, User.bot);
}