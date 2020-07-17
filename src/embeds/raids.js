const pvp = require(__dirname + "/../pvp.js");

module.exports = async (WDR, Target, Raid) => {
  let R = Raid;
  let Embed_Config = require(WDR.Dir + "/configs/embeds/" + R.Embed);

  // CHECK IF THE TARGET IS A USER
  R.Member = WDR.Bot.guilds.cache.get(R.Discord.id).members.cache.get(Target.user_id);

  // VARIABLES
  R.id = R.gym_id;
  R.lvl = R.level;

  // CHECK FOR GYM NAME AND NOTES
  R.gym = R.gym_name ? R.gym_name : "No Name";
  if (WDR.Gym_Notes && WDR.Gym_Notes[R.gym_id]) {
    R.notes = WDR.Gym_Notes[R.gym_id] ? WDR.Gym_Notes[R.gym_id].description : "";
  } else {
    R.notes = "";
  }

  // DETERMINE POKEMON NAME AND FORM OR EGG
  R.boss = R.pokemon_name ? R.pokemon_name : "Egg";

  // CHECK IF EXCLUSIVE RAID
  R.exraid = R.is_exclusive ? "**EXRaid Invite Only**\n" : "";

  // GET LOCATION INFO
  R.lat = R.latitude;
  R.lon = R.longitude;
  R.map_img = "";
  R.area = R.area.embed;
  R.map_url = WDR.Config.FRONTEND_URL;

  // MAP LINK PROVIDERS
  R.google = "[Google Maps](https://www.google.com/maps?q=" + R.latitude + "," + R.longitude + ")";
  R.apple = "[Apple Maps](http://mapR.apple.com/maps?daddr=" + R.latitude + "," + R.longitude + "&z=10&t=s&dirflg=d)";
  R.waze = "[Waze](https://www.waze.com/ul?ll=" + R.latitude + "," + R.longitude + "&navigate=yes)";
  R.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + R.latitude + "&lon=" + R.longitude + "&zoom=15)";
  R.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + R.latitude + "/" + R.longitude + "/15)";

  // DETERMINE GYM CONTROL
  switch (R.team_id) {
    case 1:
      R.team = WDR.Emotes.mystic + " Control";
      R.url = R.gym_url ? R.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_blue.png";
      R.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Mystic.png";
      break;
    case 2:
      R.team = WDR.Emotes.valor + " Control";
      R.url = R.gym_url ? R.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_red.png";
      R.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Valor.png";
      break;
    case 3:
      R.team = WDR.Emotes.instinct + " Control";
      R.url = R.gym_url ? R.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_yellow.png";
      R.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Instinct.png";
      break;
    default:
      R.team = "Uncontested Gym";
      R.url = R.gym_url ? R.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/TeamLesRaid.png";
      R.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Uncontested.png";
  }

  // CHECK IF SPONSORED GYM
  R.sponsor = (R.sponsor_id || R.ex_raid_eligible) ? WDR.Emotes.exPass + " Eligible" : "";

  // GET RAID COLOR
  switch (R.level) {
    case 1:
    case 2:
      R.color = "f358fb";
      break;
    case 3:
    case 4:
      R.color = "ffd300";
      break;
    case 5:
      R.color = "5b00de";
      break;
  }


  R.start = R.start, R.end = R.end;
  R.hatch_time = WDR.Time(R.start, "1", R.Timezone);
  R.end_time = WDR.Time(R.end, "1", R.Timezone);
  R.hatch_mins = Math.floor((R.start - (R.Time_Now / 1000)) / 60);
  R.end_mins = Math.floor((R.end - (R.Time_Now / 1000)) / 60);

  R.marker_latitude = R.latitude + .0004;

  // DETERMINE IF IT"S AN EGG OR A RAID
  switch (R.Type) {

    case "Egg":

      // GET EGG IMAGE
      switch (R.level) {
        case 1:
        case 2:
          R.sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/ic_raid_egg_normal.png";
          break;
        case 3:
        case 4:
          R.sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/ic_raid_egg_rare.png";
          break;
        case 5:
          R.sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/ic_raid_egg_legendary.png";
          break;
      }

      R.body = await WDR.Generate_Tile(WDR, "raids", R.marker_latitude, R.lon, R.embed_image, R.sprite);
      R.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + R.body;

      // CREATE THE EGG EMBED
      R.Embed = await Embed_Config(WDR, Raid);

      type = "Level " + R.level + " Raid Egg";
      break;

      // RAID IS A BOSS
    case "Boss":

      let typing = await WDR.Get_Typing(WDR, Raid);

      R.sprite = WDR.Get_Sprite(WDR, Raid);

      // RAID BOSS FORM
      R.form = R.form ? R.form : "";
      R.form = R.form == "[Normal]" ? "" : R.form;

      // DETERMIND RAID TYPES AND WEAKNESSES
      R.type = typing.type;
      R.type_noemoji = typing.type_noemoji;
      R.weaknesses = typing.weaknesses;
      R.resistances = typing.resistances;
      R.reduced = typing.reduced;

      // DETERMINE MOVE NAMES AND TYPES
      R.move_1_type = WDR.Emotes[WDR.Master.Moves[R.move_1].type.toLowerCase()];
      R.move_2_type = WDR.Emotes[WDR.Master.Moves[R.move_2].type.toLowerCase()];

      // Run Min-Max CP Calculations for Boss
      R.minCP = WDR.PvP.CalculateCP(WDR, R.pokemon_id, R.form, 10, 10, 10, 20);
      R.maxCP = WDR.PvP.CalculateCP(WDR, R.pokemon_id, R.form, 15, 15, 15, 20);
      R.minCP_boosted = WDR.PvP.CalculateCP(WDR, R.pokemon_id, R.form, 10, 10, 10, 25);
      R.maxCP_boosted = WDR.PvP.CalculateCP(WDR, R.pokemon_id, R.form, 15, 15, 15, 25);

      R.body = await WDR.Generate_Tile(WDR, "raids", R.marker_latitude, R.lon, R.embed_image, R.sprite);
      R.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + R.body;

      // CREATE THE RAID EMBED
      R.Embed = await Embed_Config(WDR, Raid);

      type = "Raid Boss";
      break;
  }
  // CHECK CONFIGS AND SEND TO USER OR FEED
  if (R.Member) {
    return WDR.Send_DM(WDR, R.Discord.id, R.Member.id, R.Embed, Target.bot);
  } else {
    return WDR.Send_Embed(WDR, R.Embed, Target.id);
  }
}