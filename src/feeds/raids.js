const Create_Raid_Embed = require(__dirname + "/../embeds/raids.js");

module.exports = async (WDR, Raid) => {

  if (WDR.Raid_Channels.length < 1) {
    return;
  }

  // FILTER FEED TYPE FOR EGG, BOSS, OR BOTH
  if (Raid.cp > 0 || Raid.is_exclusive == true) {
    Raid.Type = "Boss";
  } else {
    Raid.Type = "Egg";
  }

  for (let c = 0, clen = WDR.Raid_Channels.length; c < clen; c++) {
    let feed_channel = WDR.Raid_Channels[c];

    // LOOK UP CHANNEL
    let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!channel) {
      return WDR.Console.error(WDR, "[feeds/raids.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    // FETCH channel GEOFENCE
    channel.Geofences = feed_channel[1].geofences.split(",");
    if (!channel.Geofences) {
      return WDR.Console.error(WDR, "[feeds/raids.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    // FETCH channel FILTER
    channel.Filter = WDR.Filters.get(feed_channel[1].filter);
    if (!channel.Filter) {
      return WDR.Console.error(WDR, "[feeds/raids.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    // CHECK channel FILTER TYPE
    if (channel.Filter.Type != "raid") {
      return WDR.Console.error(WDR, "[feeds/raids.js] The filter defined for " + feed_channel[0] + " does not appear to be a raid filter.");
    }

    // ADD ROLE ID IF IT EXISTS IN channel CONFIG
    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        Raid.role_id = "@" + feed_channel[1].roleid;
      } else {
        Raid.role_id = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    // IDENTIFY THE EMBED TYPE
    let Embed_File;
    if (Raid.Type == "Egg") {
      if (!feed_channel[1].embed_egg && !feed_channel[1].embed) {
        Embed_File = "raid_eggs.js";
      } else if (feed_channel[1].embed_egg) {
        Embed_File = feed_channel[1].embed_egg;
      } else {
        Embed_File = feed_channel[1].embed ? feed_channel[1].embed : "raid_egg.js";
      }
    } else {
      Embed_File = feed_channel[1].embed ? feed_channel[1].embed : "raid_boss.js";
    }

    // let defGeo = (channel.Geofences.indexOf(Raid.area.default) >= 0);
    // let mainGeo = (channel.Geofences.indexOf(Raid.area.default) >= 0);
    // let subGeo = (channel.Geofences.indexOf(Raid.area.sub) >= 0);
    //
    // // CHECK FILTER GEOFENCES
    // if (defGeo || mainGeo || subGeo) {

    // MATCH TO GEOFENCES
    switch (true) {
      case channel.Geofences.indexOf("ALL") >= 0:
        Raid.Matched_Geofence = true;
        break;
      case channel.Geofences.indexOf(Raid.area.default) >= 0:
        Raid.Matched_Geofence = true;
        break;
      case (channel.Geofences.indexOf(Raid.area.main) >= 0):
        Raid.Matched_Geofence = true;
        break;
      case (channel.Geofences.indexOf(Raid.area.sub) >= 0):
        Raid.Matched_Geofence = true;
        break;
      default:
        Raid.Matched_Geofence = false;
    }

    if (Raid.Matched_Geofence) {

      // MATCH EGG FILTERS
      Raid.Matched_Egg = (Raid.Type == "Egg" && (channel.Filter.Egg_Levels.indexOf(Raid.level) >= 0));

      // MATCH BOSS FILTERS
      Raid.Matched_Boss = (Raid.Type == "Boss" && (channel.Filter.Boss_Levels.indexOf(Raid.level) >= 0 || channel.Filter.Boss_Levels.indexOf(Raid.pokemon_name) >= 0));

      if (Raid.Matched_Egg || Raid.Matched_Boss) {

        // MATCH EX ELIGIBILITY FILTER
        switch (true) {
          case (channel.Filter.Ex_Eligible_Only == undefined || channel.Filter.Ex_Eligible_Only != true):
            Raid.Matched_Ex_Eligibility = true;
            break;
          case (channel.Filter.Ex_Eligible_Only == Raid.ex_raid_eligible || channel.Filter.Ex_Eligible_Only == Raid.sponsor_id):
            Raid.Matched_Ex_Eligibility = true;
            break;
          default:
            Raid.Matched_Ex_Eligibility = false;
        }

        if (Raid.Matched_Ex_Eligibility) {

          let match = {};
          let Embed_Config = require(WDR.Dir + "/configs/embeds/" + Embed_File);

          // VARIABLES
          match.id = Raid.gym_id;
          match.lvl = Raid.level;

          // CHECK FOR GYM NAME AND NOTES
          match.gym = Raid.gym_name ? Raid.gym_name : "No Name";
          if (WDR.Gym_Notes && WDR.Gym_Notes[Raid.gym_id]) {
            match.notes = WDR.Gym_Notes[Raid.gym_id] ? WDR.Gym_Notes[Raid.gym_id].description : "";
          } else {
            match.notes = "";
          }

          // DETERMINE POKEMON NAME AND FORM OR EGG
          match.boss = Raid.pokemon_name ? Raid.pokemon_name : "Egg";

          // CHECK IF EXCLUSIVE RAID
          match.exraid = Raid.is_exclusive ? "**EXRaid Invite Only**\n" : "";

          // GET LOCATION INFO
          match.lat = Raid.latitude;
          match.lon = Raid.longitude;
          match.map_img = "";
          match.area = Raid.area.embed;
          match.map_url = WDR.Config.FRONTEND_URL;

          // MAP LINK PROVIDERS
          match.google = "[Google Maps](https://www.google.com/maps?q=" + match.lat + "," + match.lon + ")";
          match.apple = "[Apple Maps](http://mapmatch.apple.com/maps?daddr=" + match.lat + "," + match.lon + "&z=10&t=s&dirflg=d)";
          match.waze = "[Waze](https://www.waze.com/ul?ll=" + match.lat + "," + match.lon + "&navigate=yes)";
          match.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + match.lat + "&lon=" + match.lon + "&zoom=15)";
          match.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + match.lat + "/" + match.lon + "/15)";

          // DETERMINE GYM CONTROL
          switch (Raid.team_id) {
            case 1:
              match.team = WDR.Emotes.mystic + " Control";
              match.url = Raid.gym_url ? Raid.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_blue.png";
              match.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Mystic.png";
              break;
            case 2:
              match.team = WDR.Emotes.valor + " Control";
              match.url = Raid.gym_url ? Raid.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_red.png";
              match.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Valor.png";
              break;
            case 3:
              match.team = WDR.Emotes.instinct + " Control";
              match.url = Raid.gym_url ? Raid.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_yellow.png";
              match.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Instinct.png";
              break;
            default:
              match.team = "Uncontested Gym";
              match.url = Raid.gym_url ? Raid.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/TeamLesRaid.png";
              match.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Uncontested.png";
          }

          // CHECK IF SPONSORED GYM
          match.sponsor = (Raid.sponsor_id || Raid.ex_raid_eligible) ? WDR.Emotes.exPass + " Eligible" : "";

          // GET RAID COLOR
          switch (Raid.level) {
            case 1:
            case 2:
              match.color = "f358fb";
              break;
            case 3:
            case 4:
              match.color = "ffd300";
              break;
            case 5:
              match.color = "5b00de";
              break;
          }

          match.hatch_time = WDR.Time(Raid.start, "1", Raid.Timezone);
          match.end_time = WDR.Time(Raid.end, "1", Raid.Timezone);
          match.hatch_mins = Math.floor((Raid.start - (Raid.Time_Now / 1000)) / 60);
          match.end_mins = Math.floor((Raid.end - (Raid.Time_Now / 1000)) / 60);

          match.marker_latitude = Raid.latitude + .0004;

          // DETERMINE IF IT"S AN EGG OR A RAID
          if (Raid.Type == "Egg") {
            switch (Raid.level) {
              case 1:
              case 2:
                match.sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/ic_raid_egg_normal.png";
                break;
              case 3:
              case 4:
                match.sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/ic_raid_egg_rare.png";
                break;
              case 5:
                match.sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/ic_raid_egg_legendary.png";
                break;
            }

            match.body = await WDR.Generate_Tile(WDR, "raids", match.marker_latitude, match.lon, match.embed_image, match.sprite);
            match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;

            if (WDR.Debug.Processing_Speed == "ENABLED") {
              let difference = Math.round((new Date().getTime() - Raid.WDR_Received) / 10) / 100;
              match.footer = "Latency: " + difference + "s";
            }

            match.embed = await Embed_Config(WDR, match);

          } else {

            match.sprite = WDR.Get_Sprite(WDR, Raid);

            match.form = Raid.form_name ? Raid.form_name : "";
            match.form = match.form == "[Normal]" ? "" : match.form;

            match.typing = await WDR.Get_Typing(WDR, Raid);
            match.type = match.typing.type;
            match.type_noemoji = match.typing.type_noemoji;
            match.weaknesses = match.typing.weaknesses;
            match.resistances = match.typing.resistances;
            match.reduced = match.typing.reduced;


            match.move_1_type = WDR.Emotes[WDR.Master.Moves[Raid.move_1].type.toLowerCase()];
            match.move_2_type = WDR.Emotes[WDR.Master.Moves[Raid.move_2].type.toLowerCase()];
            match.move_1_name = Raid.move_1_name;
            match.move_2_name = Raid.move_2_name;

            match.minCP = WDR.PvP.CalculateCP(WDR, Raid.pokemon_id, Raid.form_id, 10, 10, 10, 20);
            match.maxCP = WDR.PvP.CalculateCP(WDR, Raid.pokemon_id, Raid.form_id, 15, 15, 15, 20);
            match.minCP_boosted = WDR.PvP.CalculateCP(WDR, Raid.pokemon_id, Raid.form_id, 10, 10, 10, 25);
            match.maxCP_boosted = WDR.PvP.CalculateCP(WDR, Raid.pokemon_id, Raid.form_id, 15, 15, 15, 25);

            match.body = await WDR.Generate_Tile(WDR, "raids", match.marker_latitude, match.lon, match.embed_image, match.sprite);
            match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;

            if (WDR.Debug.Processing_Speed == "ENABLED") {
              let difference = Math.round((new Date().getTime() - Raid.WDR_Received) / 10) / 100;
              match.footer = "Latency: " + difference + "s";
            }

            match.embed = await Embed_Config(WDR, match);
          }

          WDR.Send_Embed(WDR, match.embed, channel.id);
        }
      }
    }
  }
  // END
  return;
}