module.exports = (WDR, Sighting) => {

  if (WDR.Pokemon_Channels.length < 1) {
    return;
  }

  // CHECK ALL FILTERS
  WDR.Pokemon_Channels.forEach(async feed_channel => {

    // LOOK UP CHANNEL
    let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!channel) {
      return WDR.Console.error(WDR, "[feeds/pokemon.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    // FETCH CHANNEL GEOFENCE
    channel.geofences = feed_channel[1].geofences.split(",");
    if (!channel.geofences) {
      return WDR.Console.error(WDR, "[feeds/pokemon.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    // FETCH CHANNEL FILTER
    channel.filter = WDR.Filters.get(feed_channel[1].filter);
    if (!channel.filter) {
      return WDR.Console.error(WDR, "[feeds/pokemon.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    // CHECK CHANNEL FILTER TYPE
    if (channel.filter.Type != "pokemon") {
      return WDR.Console.error(WDR, "[feeds/pokemon.js] The filter defined for " + feed_channel[0] + " does not appear to be a pokemon filter.");
    }

    // ADD ROLE ID IF IT EXISTS IN CHANNEL CONFIG
    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        channel.role_id = "@" + feed_channel[1].roleid;
      } else {
        channel.role_id = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    let pobject = channel.filter[WDR.Master.Pokemon[Sighting.pokemon_id].name];
    if (!pobject) {
      return WDR.Console.error(WDR, "[feeds/pokemon.js] Missing filter data for " + WDR.Master.Pokemon[Sighting.pokemon_id].name + " in configs/filters/" + feed_channel[1].filter);
    }

    if (pobject != "False") {
      let defGeo = (channel.geofences.indexOf(Sighting.area.default) >= 0);
      let mainGeo = (channel.geofences.indexOf(Sighting.area.main) >= 0);
      let subGeo = (channel.geofences.indexOf(Sighting.area.sub) >= 0);

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

        let lvlPass = ((criteria.min_level <= Sighting.pokemon_level) && (criteria.max_level >= Sighting.pokemon_level));
        let sizePass = ((criteria.size == "all") || (criteria.size == Sighting.size));
        let genderPass = ((criteria.gender == "all") || (criteria.gender == Sighting.gender_name));
        let genPass = ((criteria.generation == "all") || (criteria.generation == Sighting.gen));
        let ivPass = ((criteria.min_iv <= Sighting.internal_value) && (criteria.max_iv >= Sighting.internal_value));

        if (lvlPass && sizePass && genderPass && genPass && ivPass) {

          let match = {};

          match.embed = (feed_channel[1].embed ? feed_channel[1].embed : "pokemon_iv.js");

          let Embed_Config = require(WDR.Dir + "/configs/embeds/" + match.embed);

          match.typing = await WDR.Get_Typing(WDR, {
            pokemon_id: Sighting.pokemon_id,
            form: Sighting.form
          });

          match.sprite = WDR.Get_Sprite(WDR, Sighting);

          match.type = match.typing.type;
          match.type_noemoji = match.typing.type_noemoji;

          match.color = match.typing.color;

          match.name = Sighting.pokemon_name;
          match.id = Sighting.pokemon_id;
          match.form = Sighting.form_name ? Sighting.form_name : "";
          match.form = Sighting.form_name == "[Normal]" ? "" : Sighting.form_name;

          match.map_url = Sighting.Discord.map_url;
          match.subscribe_url = Sighting.Discord.subscribe_url;

          match.iv = Sighting.internal_value;
          match.cp = Sighting.cp;

          match.lat = Sighting.latitude;
          match.lon = Sighting.longitude;

          match.weather_boost = Sighting.weather_boost;

          match.area = Sighting.area.embed;

          match.map_url = WDR.Config.FRONTEND_URL;

          match.atk = Sighting.individual_attack;
          match.def = Sighting.individual_defense;
          match.sta = Sighting.individual_stamina;

          match.lvl = Sighting.pokemon_level;
          match.gen = Sighting.gen;

          match.move_1_type = WDR.Emotes[WDR.Master.Moves[Sighting.move_1].type.toLowerCase()];
          match.move_2_type = WDR.Emotes[WDR.Master.Moves[Sighting.move_2].type.toLowerCase()];
          match.move_1_name = Sighting.move_1_name;
          match.move_2_name = Sighting.move_2_name;

          match.height = Math.floor(Sighting.height * 100) / 100;
          match.weight = Math.floor(Sighting.weight * 100) / 100;
          match.size = await WDR.Capitalize(Sighting.size);

          match.google = "[Google Maps](https://www.google.com/maps?q=" + Sighting.latitude + "," + Sighting.longitude + ")";
          match.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + Sighting.latitude + "," + Sighting.longitude + "&z=10&t=s&dirflg=d)";
          match.waze = "[Waze](https://www.waze.com/ul?ll=" + Sighting.latitude + "," + Sighting.longitude + "&navigate=yes)";
          match.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + Sighting.latitude + "&lon=" + Sighting.longitude + "&zoom=15)";
          match.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + Sighting.latitude + "/" + Sighting.longitude + "/15)";

          match.verified = Sighting.disappear_time_verified ? WDR.Emotes.checkYes : WDR.Emotes.yellowQuestion;
          match.time = WDR.Time(Sighting.disappear_time, "1", Sighting.Timezone);
          match.mins = Math.floor((Sighting.disappear_time - (Sighting.Time_Now / 1000)) / 60);
          match.secs = Math.floor((Sighting.disappear_time - (Sighting.Time_Now / 1000)) - (match.mins * 60));

          if (match.mins >= 5) {

            if (WDR.Config.POKEMON_PREGEN_TILES != "DISABLED") {
              if (Sighting.static_map) {
                match.body = Sighting.body;
                match.static_map = Sighting.static_map;
              } else {
                match.body = await WDR.Generate_Tile(WDR, Sighting, "pokemon", match.lat, match.lon, match.sprite);
                Sighting.body = match.body;
                match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;
                Sighting.static_map = match.static_map;
              }
            }

            if (WDR.Debug.Processing_Speed == "ENABLED") {
              let difference = Math.round((new Date().getTime() - Sighting.WDR_Received) / 10) / 100;
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