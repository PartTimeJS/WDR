module.exports = (WDR, SIGHTING) => {

  if (WDR.Pokemon_Channels.length < 1) {
    return;
  }

  WDR.Pokemon_Channels.forEach(async feed_channel => {

    let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!channel) {
      return WDR.Console.error(WDR, "[feeds/pokemon.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    channel.geofences = feed_channel[1].geofences.split(",");
    if (!channel.geofences) {
      return WDR.Console.error(WDR, "[feeds/pokemon.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    channel.filter = WDR.Filters.get(feed_channel[1].filter);
    if (!channel.filter) {
      return WDR.Console.error(WDR, "[feeds/pokemon.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    if (channel.filter.Type != "pokemon") {
      return WDR.Console.error(WDR, "[feeds/pokemon.js] The filter defined for " + feed_channel[0] + " does not appear to be a pokemon filter.");
    }

    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        channel.role_id = "@" + feed_channel[1].roleid;
      } else {
        channel.role_id = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    let pobject = channel.filter[WDR.Master.Pokemon[SIGHTING.pokemon_id].name];
    if (!pobject) {
      return WDR.Console.error(WDR, "[feeds/pokemon.js] Missing filter data for " + WDR.Master.Pokemon[SIGHTING.pokemon_id].name + " in configs/filters/" + feed_channel[1].filter);
    } else if (pobject != "False") {

      let defGeo = (channel.geofences.indexOf(SIGHTING.area.default) >= 0);
      let mainGeo = (channel.geofences.indexOf(SIGHTING.area.main) >= 0);
      let subGeo = (channel.geofences.indexOf(SIGHTING.area.sub) >= 0);
      if (defGeo || mainGeo || subGeo) {

        let criteria = {};

        criteria.gender = (channel.filter.gender == undefined ? "all" : channel.filter.gender).toLowerCase();
        criteria.size = (channel.filter.size == undefined ? "all" : channel.filter.size).toLowerCase();
        criteria.generation = channel.filter.generation == undefined ? "all" : channel.filter.generation;
        criteria.min_iv = channel.filter.min_iv == undefined ? 0 : channel.filter.min_iv;
        criteria.max_iv = channel.filter.max_iv == undefined ? 100 : channel.filter.max_iv;
        criteria.min_level = channel.filter.min_level == undefined ? 0 : channel.filter.min_level;
        criteria.max_level = channel.filter.max_level == undefined ? 35 : channel.filter.max_level;

        if (pobject != "True") {
          criteria.gender = (pobject.gender == undefined ? criteria.gender : pobject.gender).toLowerCase();
          criteria.size = (pobject.size == undefined ? criteria.size : pobject.size).toLowerCase();
          criteria.generation = pobject.generation == undefined ? criteria.generation : pobject.generation;
          criteria.min_iv = pobject.min_iv == undefined ? criteria.min_iv : pobject.min_iv;
          criteria.max_iv = pobject.max_iv == undefined ? criteria.max_iv : pobject.max_iv;
          criteria.min_level = pobject.min_level == undefined ? criteria.min_level : pobject.min_level;
          criteria.max_level = pobject.max_level == undefined ? criteria.max_level : pobject.max_level;
        }

        let lvlPass = ((criteria.min_level <= SIGHTING.pokemon_level) && (criteria.max_level >= SIGHTING.pokemon_level));
        let sizePass = ((criteria.size == "all") || (criteria.size == SIGHTING.size));
        let genderPass = ((criteria.gender == "all") || (criteria.gender == SIGHTING.gender_name));
        let genPass = ((criteria.generation == "all") || (criteria.generation == SIGHTING.gen));
        let ivPass = ((criteria.min_iv <= SIGHTING.internal_value) && (criteria.max_iv >= SIGHTING.internal_value));
        if (lvlPass && sizePass && genderPass && genPass && ivPass) {

          let match = {};

          let Embed_Config = require(WDR.Dir + "/configs/embeds/" + (feed_channel[1].embed ? feed_channel[1].embed : "pokemon_iv.js"));

          match.typing = await WDR.Get_Typing(WDR, {
            pokemon_id: SIGHTING.pokemon_id,
            form: SIGHTING.form
          });

          match.sprite = WDR.Get_Sprite(WDR, SIGHTING);

          match.type = match.typing.type;
          match.type_noemoji = match.typing.type_noemoji;

          match.color = match.typing.color;

          match.name = SIGHTING.pokemon_name;
          match.id = SIGHTING.pokemon_id;
          match.form = SIGHTING.form_name ? SIGHTING.form_name : "";
          match.form = SIGHTING.form_name == "[Normal]" ? "" : SIGHTING.form_name;

          match.map_url = SIGHTING.Discord.map_url;
          match.subscribe_url = SIGHTING.Discord.subscribe_url;

          match.iv = SIGHTING.internal_value;
          match.cp = SIGHTING.cp;

          match.lat = SIGHTING.latitude;
          match.lon = SIGHTING.longitude;

          match.weather_boost = SIGHTING.weather_boost;

          match.area = SIGHTING.area.embed;

          match.map_url = WDR.Config.FRONTEND_URL;

          match.atk = SIGHTING.individual_attack;
          match.def = SIGHTING.individual_defense;
          match.sta = SIGHTING.individual_stamina;

          match.lvl = SIGHTING.pokemon_level;
          match.gen = SIGHTING.gen;

          match.move_1_type = WDR.Emotes[WDR.Master.Moves[SIGHTING.move_1].type.toLowerCase()];
          match.move_2_type = WDR.Emotes[WDR.Master.Moves[SIGHTING.move_2].type.toLowerCase()];
          match.move_1_name = SIGHTING.move_1_name;
          match.move_2_name = SIGHTING.move_2_name;

          match.height = Math.floor(SIGHTING.height * 100) / 100;
          match.weight = Math.floor(SIGHTING.weight * 100) / 100;
          match.size = await WDR.Capitalize(SIGHTING.size);

          match.google = "[Google Maps](https://www.google.com/maps?q=" + SIGHTING.latitude + "," + SIGHTING.longitude + ")";
          match.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + SIGHTING.latitude + "," + SIGHTING.longitude + "&z=10&t=s&dirflg=d)";
          match.waze = "[Waze](https://www.waze.com/ul?ll=" + SIGHTING.latitude + "," + SIGHTING.longitude + "&navigate=yes)";
          match.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + SIGHTING.latitude + "&lon=" + SIGHTING.longitude + "&zoom=15)";
          match.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + SIGHTING.latitude + "/" + SIGHTING.longitude + "/15)";

          match.verified = SIGHTING.disappear_time_verified ? WDR.Emotes.checkYes : WDR.Emotes.yellowQuestion;
          match.time = WDR.Time(SIGHTING.disappear_time, "1", SIGHTING.Timezone);
          match.mins = Math.floor((SIGHTING.disappear_time - (SIGHTING.Time_Now / 1000)) / 60);
          match.secs = Math.floor((SIGHTING.disappear_time - (SIGHTING.Time_Now / 1000)) - (match.mins * 60));

          if (match.mins >= 5) {

            if (WDR.Config.POKEMON_PREGEN_TILES != "DISABLED") {
              if (SIGHTING.static_map) {
                match.static_map = SIGHTING.static_map;
              } else {
                match.body = await WDR.Generate_Tile(WDR, SIGHTING, "pokemon", match.lat, match.lon, match.sprite);
                SIGHTING.body = match.body;
                match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;
                SIGHTING.static_map = match.static_map;
              }
            }

            if (WDR.Debug.Processing_Speed == "ENABLED") {
              let difference = Math.round((new Date().getTime() - SIGHTING.WDR_Received) / 10) / 100;
              match.footer = "Latency: " + difference + "s";
            }

            match.embed = Embed_Config(WDR, match);

            WDR.Send_Embed(WDR, match.embed, channel.id);
          }
        }
      }
    }
  });

  // END
  return;
}