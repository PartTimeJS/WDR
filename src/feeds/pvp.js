module.exports = async (WDR, Sighting) => {

  if (WDR.PvP_Channels.length < 1) {
    return;
  }

  WDR.PvP_Channels.forEach(async feed_channel => {

    // LOOK UP CHANNEL
    let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!channel) {
      return console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [feeds/pvp.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    // FETCH CHANNEL GEOFENCE
    channel.Geofences = feed_channel[1].geofences.split(",");
    if (!channel.Geofences) {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pvp.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    // FETCH CHANNEL FILTER
    channel.Filter = WDR.Filters.get(feed_channel[1].filter);
    if (!channel.Filter) {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pvp.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    // CHECK CHANNEL FILTER TYPE
    if (channel.Filter.Type != "pvp") {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pvp.js] The filter defined for " + feed_channel[0] + " does not appear to be a pvp filter.");
    }

    // ADD ROLE ID IF IT EXISTS IN CHANNEL CONFIG
    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        Sighting.Role_ID = "@" + feed_channel[1].roleid;
      } else {
        Sighting.Role_ID = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    let Embed_File = feed_channel[1].embed ? feed_channel[1].embed : "pvp.js";

    let defGeo = (channel.Geofences.indexOf(Sighting.Area.Default) >= 0);
    let mainGeo = (channel.Geofences.indexOf(Sighting.Area.Default) >= 0);
    let subGeo = (channel.Geofences.indexOf(Sighting.Area.Sub) >= 0);

    // CHECK FILTER GEOFENCES
    if (defGeo || mainGeo || subGeo) {

      // CHECK FILTER VARIABLES
      if (!channel.Filter.min_cp_range && channel.Filter.min_level !== 0) {
        return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pvp.js] Missing `min_cp_range` variable in " + feed_channel[1].filter + ".");
      } else if (!channel.Filter.max_cp_range) {
        return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pvp.js] Missing `max_cp_range` variable in " + feed_channel[1].filter + ".");
      }
      //let cpRange = ((Sighting.cp <= channel.Filter.max_cp_range) && (Sighting.cp >= channel.Filter.min_cp_range));
      let cpRange = (Sighting.cp <= channel.Filter.max_cp_range);

      if (!channel.Filter.min_level && channel.Filter.min_level !== 0) {
        return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pvp.js] Missing `min_level` variable in " + feed_channel[1].filter + ".");
      }
      let lvlRange = (Sighting.pokemon_level >= channel.Filter.min_level);

      if (!channel.Filter[WDR.Master.Pokemon[Sighting.pokemon_id].name]) {
        return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pvp.js] Missing `" + WDR.Master.Pokemon[Sighting.pokemon_id].name + "` in " + feed_channel[1].filter + ".");
      }
      let filterStatus = (channel.Filter[WDR.Master.Pokemon[Sighting.pokemon_id].name] == 'True');

      //if (cpRange && lvlRange && filterStatus) {
      if (cpRange && filterStatus) {

        let pvp = {};

        pvp.possible_cps = [];

        pvp.league = channel.Filter.league.toLowerCase() + "_league";

        Sighting[pvp.league].forEach(potential => {
          let rankMatch = potential.rank <= channel.Filter.min_pvp_rank;
          let cpMatch = potential.cp >= channel.Filter.min_cp_range;
          if (rankMatch && cpMatch) {
            let match = {};
            match.pokemon_id = potential.pokemon_id;
            match.rank = potential.rank;
            match.percent = potential.percent;
            match.level = potential.level;
            match.cp = potential.cp;
            match.value = potential.pvp_value;
            match.form_id = potential.form_id;
            pvp.possible_cps.push(match);
          }
        });

        if (pvp.possible_cps.length > 0) {
          let Embed_Config = require(WDR.dir + "/configs/embeds/" + Embed_File);
          if (channel.Filter.league.toLowerCase() == "ultra") {
            console.log("data1", pvp.possible_cps);
          }
          pvp.typing = await WDR.Get_Typing(WDR, {
            pokemon_id: Sighting.pokemon_id,
            form: Sighting.form
          });
          pvp.sprite = WDR.Get_Sprite(WDR, {
            pokemon_id: pvp.possible_cps[0].pokemon_id,
            form: pvp.possible_cps[0].form_id
          });
          pvp.tile_sprite = WDR.Get_Sprite(WDR, {
            pokemon_id: Sighting.pokemon_id,
            form: Sighting.form_id
          });
          pvp.type_wemoji = pvp.typing.type;
          pvp.type_noemoji = pvp.typing.type_noemoji;
          pvp.color = pvp.typing.color;
          pvp.gender_wemoji = Sighting.gender_wemoji
          pvp.gender_noemoji = Sighting.gender_noemoji
          if (channel.Filter.league.toLowerCase() == "ultra") {
            console.log("data2", pvp.possible_cps);
          }
          pvp.name = Sighting.pokemon_name;
          pvp.form = Sighting.form_name ? Sighting.form_name : "";
          pvp.form = Sighting.form_name == "[Normal]" ? "" : Sighting.form_name;
          pvp.id = Sighting.pokemon_id;
          pvp.iv = Sighting.internal_value;
          pvp.cp = Sighting.cp;
          pvp.lat = Sighting.latitude;
          pvp.lon = Sighting.longitude;
          pvp.weather_boost = Sighting.weather_boost;
          pvp.area = Sighting.Area.Embed;
          pvp.map_url = WDR.Config.FRONTEND_URL;
          pvp.height = Math.floor(Sighting.height * 100) / 100;
          pvp.weight = Math.floor(Sighting.weight * 100) / 100;
          pvp.atk = Sighting.individual_attack;
          pvp.def = Sighting.individual_defense;
          pvp.sta = Sighting.individual_stamina;
          pvp.lvl = Sighting.pokemon_level;
          pvp.gen = Sighting.gen
          pvp.move_1_type = WDR.Emotes[WDR.Master.Moves[Sighting.move_1].type.toLowerCase()];
          pvp.move_2_type = WDR.Emotes[WDR.Master.Moves[Sighting.move_2].type.toLowerCase()];
          pvp.move_1_name = Sighting.move_1_name;
          pvp.move_2_name = Sighting.move_2_name;
          pvp.height = Math.floor(Sighting.height * 100) / 100;
          pvp.weight = Math.floor(Sighting.weight * 100) / 100;
          pvp.size = await WDR.Capitalize(Sighting.size);
          pvp.google = "[Google Maps](https://www.google.com/maps?q=" + pvp.lat + "," + pvp.lon + ")";
          pvp.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + pvp.lat + "," + pvp.lon + "&z=10&t=s&dirflg=d)";
          pvp.waze = "[Waze](https://www.waze.com/ul?ll=" + pvp.lat + "," + pvp.lon + "&navigate=yes)";
          pvp.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + pvp.lat + "&lon=" + pvp.lon + "&zoom=15)";
          pvp.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + pvp.lat + "/" + pvp.lon + "/15)";
          pvp.verified = Sighting.disappear_time_verified ? WDR.Emotes.checkYes : WDR.Emotes.yellowQuestion;
          pvp.time = WDR.Time(Sighting.disappear_time, "1", Sighting.Timezone);
          pvp.mins = Math.floor((Sighting.disappear_time - (Sighting.Time_Now / 1000)) / 60);
          pvp.secs = Math.floor((Sighting.disappear_time - (Sighting.Time_Now / 1000)) - (pvp.mins * 60));
          pvp.pvp_data = "";
          pvp.possible_cps.forEach(pcp => {
            let pipe = " | "; // SPACING
            let Name = WDR.Master.Pokemon[pcp.pokemon_id].name;
            let Level = "Lvl " + pcp.level;
            let Cp = "CP " + pcp.cp;
            let Rank = "**Rank " + pcp.rank + "**";
            let Percent = pcp.percent + "%";
            let string = Rank + " " + Name + " (" + Percent + ")\n" + Level + pipe + Cp + pipe + pvp.atk + "/" + pvp.def + "/" + pvp.sta;
            pvp.pvp_data += string + "\n";
          });
          if (channel.Filter.league.toLowerCase() == "ultra") {
            console.log("ultra\n", pvp.pvp_data);
          }
          pvp.ranks = "";
          pvp.possible_cps.forEach(rank_cp => {
            pvp.ranks += "Rank " + rank_cp.rank + " (" + WDR.Master.Pokemon[rank_cp.pokemon_id].name + ")\n";
          });
          pvp.pvp_data = "";
          if (WDR.Debug.Processing_Speed == "ENABLED") {
            let difference = Math.round((new Date().getTime() - Sighting.WDR_Received) / 10) / 100;
            pvp.footer = "Latency: " + difference + "s";
          }
          pvp.embed = Embed_Config(WDR, pvp);
          if (!pvp.embed.image) {
            pvp.body = await WDR.Generate_Tile(WDR, "pokemon", pvp.lat, pvp.lon, pvp.tile_sprite);
            pvp.embed.image = {
              url: WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + pvp.body
            };
          }
          WDR.Send_Embed(WDR, pvp.embed, channel.id);
        }
      }
    }
  });

  // END
  return;
}