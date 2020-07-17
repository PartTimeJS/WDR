module.exports = async (WDR, Target, Invasion) => {
  let Embed_Config = require(WDR.Dir + "/configs/embeds/" + Invasion.Embed);

  // CHECK IF THE TARGET IS A USER
  Invasion.Member = WDR.Bot.guilds.cache.get(Invasion.Discord.id).members.cache.get(Target.user_id);

  // VARIABLES
  Invasion.name = Invasion.name;
  Invasion.url = Invasion.url ? Invasion.url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png";

  // DETERMIND INVASION TYPES AND WEAKNESSES
  Invasion.weaknesses = "";
  Invasion.resistances = "";
  //Invasion.type = WDR.Emotes[Invasion.grunt_type.toLowerCase()] ? WDR.Emotes[Invasion.grunt_type.toLowerCase()] : "";
  Invasion.color = WDR.Get_Type_Color(WDR.Master.Grunt_Types[Invasion.grunt_type].type);
  Invasion.time = WDR.Time(Invasion.incident_expire_timestamp, "1", Invasion.Timezone);
  Invasion.mins = Math.floor((Invasion.incident_expire_timestamp - (Invasion.Time_Now / 1000)) / 60);
  Invasion.secs = Math.floor((Invasion.incident_expire_timestamp - (Invasion.Time_Now / 1000)) - ((Math.floor((Invasion.incident_expire_timestamp - (Invasion.Time_Now / 1000)) / 60)) * 60));
  Invasion.lat = Invasion.latitude;
  Invasion.lon = Invasion.longitude;
  Invasion.area = Invasion.area.embed;
  Invasion.map_url = WDR.Config.FRONTEND_URL;

  // MAP LINK PROVIDERS
  Invasion.google = "[Google Maps](https://www.google.com/maps?q=" + Invasion.latitude + "," + Invasion.longitude + ")";
  Invasion.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + Invasion.latitude + "," + Invasion.longitude + "&z=10&t=s&dirflg=d)";
  Invasion.waze = "[Waze](https://www.waze.com/ul?ll=" + Invasion.latitude + "," + Invasion.longitude + "&navigate=yes)";
  Invasion.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + Invasion.latitude + "&lon=" + Invasion.longitude + "&zoom=15)";
  Invasion.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + Invasion.latitude + "/" + Invasion.longitude + "/15)";

  // OTHER VARIABLES
  Invasion.encounters = "Unknown";
  Invasion.battles = "Unknown";
  Invasion.first = "";
  Invasion.second = "";
  Invasion.third = "";

  // // WEAKNESSES FOR INVASION TYPES
  // if(type == "Tier II" && WDR.Master.Grunt_Types[Invasion.grunt_type].encounters){ type = WDR.Master.Pokemon[parseInt(WDR.Master.Grunt_Types[Invasion.grunt_type].encounters.first[0].split("_")[0])].types[0] }
  // if(type != "Tier II" && WDR.types[type]){
  //   WDR.types[type].resistances.forEach((resistance,index) => {
  //     WDR.types[type].weaknesses.forEach((weakness,index) => {
  //       if(Invasion.weaknesses.indexOf(WDR.Emotes[weakness.toLowerCase()]) < 0){
  //         Invasion.weaknesses += WDR.Emotes[weakness.toLowerCase()]+" ";
  //       }
  //       if(Invasion.resistances.indexOf(WDR.Emotes[resistance.toLowerCase()]) < 0){
  //         Invasion.resistances += WDR.Emotes[resistance.toLowerCase()]+" ";
  //       }
  //     });
  //   });
  // }
  if (!Invasion.resistances || Invasion.resistances.trim() == "undefined") {
    Invasion.resistances = "None";
  }
  if (!Invasion.weaknesses || Invasion.weaknesses.trim() == "undefined") {
    Invasion.weaknesses = "None";
  }

  // Generate A Sprite Image for Embed
  switch (WDR.Master.Grunt_Types[Invasion.grunt_type].grunt) {
    case "Male":
      Invasion.sprite = "https://cdn.discordapp.com/attachments/487387866394263552/605492063768936451/male_grunt_face_pink.png";
      Invasion.gender = " " + WDR.Emotes.male;
      break;
    case "Female":
      Invasion.sprite = "https://cdn.discordapp.com/attachments/487387866394263552/605492065643659315/female_grunt_face_pink.png";
      Invasion.gender = " " + WDR.Emotes.female;
      break;
    default:
      Invasion.sprite = "https://i.imgur.com/aAS6VUM.png";
      Invasion.gender = "";
  }

  Invasion.marker_latitude = Invasion.latitude + .00045;

  // STATIC MAP TILE
  Invasion.static_marker = [{
      "url": "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/other/Pokestop_Expanded_Rocket.png",
      "height": 62,
      "width": 50,
      "x_offset": 0,
      "y_offset": 0,
      "latitude": Invasion.marker_latitude,
      "longitude": Invasion.longitude
    },
    {
      "url": Invasion.sprite,
      "height": 40,
      "width": 40,
      "x_offset": 0,
      "y_offset": -45,
      "latitude": Invasion.marker_latitude,
      "longitude": Invasion.longitude
    }
  ];

  Invasion.static_map = WDR.Config.STATIC_MAP_URL + "&latitude=" + Invasion.marker_latitude + "&longitude=" + Invasion.longitude + "&zoom=" + WDR.Config.STATIC_ZOOM + "&width=" + WDR.Config.STATIC_WIDTH + "&height=" + WDR.Config.STATIC_HEIGHT + "&scale=2&markers=" + encodeURIComponent(JSON.stringify(Invasion.static_marker));


  // POSSIBLE ENCOUNTERS
  if (WDR.Master.Grunt_Types[Invasion.grunt_type].encounters) {
    let name = "",
      pokemon_id = "";
    if (WDR.Master.Grunt_Types[Invasion.grunt_type].encounters.first) {
      WDR.Master.Grunt_Types[Invasion.grunt_type].encounters.first.forEach((id) => {
        pokemon_id = parseInt(id.split("_")[0]);
        if (WDR.Emotes[WDR.Master.Pokemon[pokemon_id].name] != undefined) {
          name = WDR.Emotes[WDR.Master.Pokemon[pokemon_id].name]
        } else {
          name = WDR.Master.Pokemon[pokemon_id].name
        }
        Invasion.first += name + " ";
      });
    }
    if (WDR.Master.Grunt_Types[Invasion.grunt_type].encounters.second) {
      WDR.Master.Grunt_Types[Invasion.grunt_type].encounters.second.forEach((id) => {
        pokemon_id = parseInt(id.split("_")[0]);
        if (WDR.Emotes[WDR.Master.Pokemon[pokemon_id].name] != undefined) {
          name = WDR.Emotes[WDR.Master.Pokemon[pokemon_id].name]
        } else {
          name = WDR.Master.Pokemon[pokemon_id].name
        }
        if (Invasion.first.indexOf(name) < 0 && Invasion.first.indexOf(WDR.Emotes[WDR.Master.Pokemon[pokemon_id].name]) < 0) {
          Invasion.second += name + " ";
        }
      });
    }
    if (WDR.Master.Grunt_Types[Invasion.grunt_type].encounters.third) {
      WDR.Master.Grunt_Types[Invasion.grunt_type].encounters.third.forEach((id) => {
        pokemon_id = parseInt(id.split("_")[0]);
        if (WDR.Emotes[WDR.Master.Pokemon[pokemon_id].name] != undefined) {
          name = WDR.Emotes[WDR.Master.Pokemon[pokemon_id].name]
        } else {
          name = WDR.Master.Pokemon[pokemon_id].name
        }
        if (Invasion.first.indexOf(name) < 0 && Invasion.second.indexOf(name) < 0 && Invasion.first.indexOf(WDR.Emotes[WDR.Master.Pokemon[pokemon_id].name]) < 0 && Invasion.second.indexOf(WDR.Emotes[WDR.Master.Pokemon[pokemon_id].name]) < 0) {
          Invasion.third += name + " ";
        }
      });
    }
  }

  if (WDR.Master.Grunt_Types[Invasion.grunt_type].second_reward && WDR.Master.Grunt_Types[Invasion.grunt_type].second_reward == "true") {
    Invasion.encounters = "";
    Invasion.encounters += "**85% Chance to Encounter**:\n " + Invasion.first + "\n";
    Invasion.encounters += "**15% Chance to Encounter**:\n " + Invasion.second + "\n";
  } else if (WDR.Master.Grunt_Types[Invasion.grunt_type].encounters) {
    Invasion.encounters = "";
    Invasion.encounters += "**100% Chance to Encounter**:\n " + Invasion.first + "\n";
    if (Invasion.first.length <= 25) {
      Invasion.sprite = WDR.Get_Sprite(WDR, {
        pokemon_id: parseInt(WDR.Master.Grunt_Types[Invasion.grunt_type].encounters.first[0].split("_")[0]),
        form: parseInt(WDR.Master.Grunt_Types[Invasion.grunt_type].encounters.first[0].split("_")[1])
      });
    }
  }

  // MALE OR FEMALE GRUNT?
  Invasion.grunt_gender = WDR.Master.Grunt_Types[Invasion.grunt_type].grunt;
  Invasion.grunt_type = WDR.Master.Grunt_Types[Invasion.grunt_type].type;

  Invasion.Embed = await Embed_Config(WDR, Invasion);

  if (Invasion.Member) {

    return WDR.Send_DM(WDR, Invasion.Discord.id, Invasion.Member.id, Invasion.Embed, Target.bot);

  } else {

    if (Invasion.mins < WDR.Config.TIME_REWDR) {
      return;
    }

    return WDR.Send_Embed(WDR, Invasion.Embed, Target.id);
  }
}