module.exports = async (WDR, Sighting) => {

  if (WDR.PvP_Channels.length < 1) {
    return;
  }

  for (let c = 0, clen = WDR.PvP_Channels.length; c < clen; c++) {
    let feed_channel = WDR.PvP_Channels[c];

    let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!channel) {
      return WDR.Console.error(WDR, "[feeds/pvp.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    channel.Geofences = feed_channel[1].geofences.split(",");
    if (!channel.Geofences) {
      return WDR.Console.error(WDR, "[feeds/pvp.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    channel.Filter = WDR.Filters.get(feed_channel[1].filter);
    if (!channel.Filter) {
      return WDR.Console.error(WDR, "[feeds/pvp.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    if (channel.Filter.Type != "pvp") {
      return WDR.Console.error(WDR, "[feeds/pvp.js] The filter defined for " + feed_channel[0] + " does not appear to be a pvp filter.");
    }

    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        Sighting.role_id = "@" + feed_channel[1].roleid;
      } else {
        Sighting.role_id = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    let Embed_File = feed_channel[1].embed ? feed_channel[1].embed : "pvp.js";

    let defGeo = (channel.Geofences.indexOf(Sighting.area.default) >= 0);
    let mainGeo = (channel.Geofences.indexOf(Sighting.area.main) >= 0);
    let subGeo = (channel.Geofences.indexOf(Sighting.area.sub) >= 0);

    if (defGeo || mainGeo || subGeo) {

      if (!channel.Filter.min_cp_range && channel.Filter.min_level !== 0) {
        return WDR.Console.error(WDR, "[feeds/pvp.js] Missing `min_cp_range` variable in " + feed_channel[1].filter + ".");
      } else if (!channel.Filter.max_cp_range) {
        return WDR.Console.error(WDR, "[feeds/pvp.js] Missing `max_cp_range` variable in " + feed_channel[1].filter + ".");
      }

      //let cpRange = ((Sighting.cp <= channel.Filter.max_cp_range) && (Sighting.cp >= channel.Filter.min_cp_range));
      //let cpRange = (Sighting.cp <= channel.Filter.max_cp_range);

      if (!channel.Filter.min_level && channel.Filter.min_level !== 0) {
        return WDR.Console.error(WDR, "[feeds/pvp.js] Missing `min_level` variable in " + feed_channel[1].filter + ".");
      }
      let lvlRange = (Sighting.pokemon_level >= channel.Filter.min_level);

      if (!channel.Filter[WDR.Master.Pokemon[Sighting.pokemon_id].name]) {
        return WDR.Console.error(WDR, "[feeds/pvp.js] Missing `" + WDR.Master.Pokemon[Sighting.pokemon_id].name + "` in " + feed_channel[1].filter + ".");
      }
      let filterStatus = (channel.Filter[WDR.Master.Pokemon[Sighting.pokemon_id].name] == 'True');

      if (lvlRange && filterStatus) {
        //if (cpRange && filterStatus) {

        let match = {
          pvp_data: "",
          possible_cps: [],
          league: channel.Filter.league.toLowerCase() + "_league"
        };

        for (let l = 0, llen = Sighting[match.league].length; l < llen; l++) {
          let potential = Sighting[match.league][l];
          potential.typing = await WDR.Get_Typing(WDR, {
            pokemon_id: potential.pokemon_id,
            form: potential.form,
            type: "type_array"
          });
          let rankMatch = potential.rank <= channel.Filter.min_pvp_rank;
          let cpMatch = potential.cp >= channel.Filter.min_cp_range;
          let typeMatch = (channel.Filter.type == "all") ? true : potential.typing.some(type => channel.Filter.type.includes(type));
          if (rankMatch && cpMatch && typeMatch) {
            let filtered = {};
            filtered.types = potential.typing;
            filtered.pokemon_id = potential.pokemon_id;
            filtered.rank = potential.rank;
            filtered.percent = potential.percentage;
            filtered.level = potential.level;
            filtered.cp = potential.cp;
            filtered.value = potential.pvp_value;
            filtered.form_id = potential.form_id;
            match.possible_cps.push(filtered);
          }
        }

        if (match.possible_cps.length > 0) {

          let Embed_Config = require(WDR.Dir + "/configs/embeds/" + Embed_File);

          match.typing = await WDR.Get_Typing(WDR, {
            pokemon_id: Sighting.pokemon_id,
            form: Sighting.form
          });
          match.pokemon_id = match.possible_cps[0].pokemon_id;
          match.form = match.possible_cps[0].form_id;
          match.sprite = WDR.Get_Sprite(WDR, match);

          match.tile_sprite = WDR.Get_Sprite(WDR, Sighting);

          match.type_wemoji = match.typing.type;
          match.type_noemoji = match.typing.type_noemoji;

          match.color = match.typing.color;

          match.gender_wemoji = Sighting.gender_wemoji
          match.gender_noemoji = Sighting.gender_noemoji

          match.name = Sighting.pokemon_name;
          match.id = Sighting.pokemon_id;
          match.form = Sighting.form_name ? Sighting.form_name : "";
          match.form = Sighting.form_name == "[Normal]" ? "" : Sighting.form_name;

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

          match.google = "[Google Maps](https://www.google.com/maps?q=" + match.lat + "," + match.lon + ")";
          match.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + match.lat + "," + match.lon + "&z=10&t=s&dirflg=d)";
          match.waze = "[Waze](https://www.waze.com/ul?ll=" + match.lat + "," + match.lon + "&navigate=yes)";
          match.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + match.lat + "&lon=" + match.lon + "&zoom=15)";
          match.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + match.lat + "/" + match.lon + "/15)";

          match.verified = Sighting.disappear_time_verified ? WDR.Emotes.checkYes : WDR.Emotes.yellowQuestion;
          match.time = WDR.Time(Sighting.disappear_time, "1", Sighting.Timezone);
          match.mins = Math.floor((Sighting.disappear_time - (Sighting.Time_Now / 1000)) / 60);
          match.secs = Math.floor((Sighting.disappear_time - (Sighting.Time_Now / 1000)) - (match.mins * 60));

          match.pvp_data = "";

          match.ranks = "";
          match.possible_cps.forEach(rank_cp => {
            match.ranks += "Rank " + rank_cp.rank + " (" + WDR.Master.Pokemon[rank_cp.pokemon_id].name + ")\n";
          });

          if (match.mins >= 5) {

            if (WDR.Config.POKEMON_PREGEN_TILES != "DISABLED") {
              if (Sighting.static_map) {
                match.body = Sighting.body;
                match.static_map = Sighting.static_map;
              } else {
                match.body = await WDR.Generate_Tile(WDR, Sighting, "pokemon", match.lat, match.lon, match.tile_sprite);
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
  }

  // END
  return;
}