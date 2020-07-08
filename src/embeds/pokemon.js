module.exports = async (WDR, User, Channel, Sighting) => {
  let Sighting_Embed = Sighting;
  let Embed_Config = require(WDR.dir + "/configs/embeds/" + Sighting_Embed.Embed);

  // CHECK IF THE TARGET IS A USER
  if (User) {
    Sighting_Embed.Member = WDR.Bot.guilds.cache.get(Sighting_Embed.Discord.id).members.cache.get(User.user_id);
  } else {
    delete Sighting_Embed.Member;
  }

  // VARIABLES POKEMON NAME, FORM AND TYPE EMOTES
  let typing = await WDR.Get_Typing(WDR, Sighting_Embed);

  // POKEMON OBJECT
  Sighting_Embed.name = Sighting_Embed.pokemon_name;
  Sighting_Embed.form_name = Sighting_Embed.form_name ? Sighting_Embed.form_name : "";
  Sighting_Embed.form_name = Sighting_Embed.form_name == "[Normal]" ? "" : Sighting_Embed.form_name;
  Sighting_Embed.id = Sighting_Embed.pokemon_id;

  Sighting_Embed.sprite = WDR.Get_Sprite(WDR, Sighting_Embed);
  Sighting_Embed.iv = Sighting_Embed.internal_value;
  Sighting_Embed.type = typing.type;
  Sighting_Embed.type_noemoji = typing.type_noemoji;
  Sighting_Embed.color = typing.color;
  Sighting_Embed.lat = Sighting_Embed.latitude;
  Sighting_Embed.lon = Sighting_Embed.longitude;
  Sighting_Embed.area = Sighting_Embed.Area.Embed;
  Sighting_Embed.map_url = WDR.Config.FRONTEND_URL;

  // DETERMINE MOVE NAMES AND TYPES
  Sighting_Embed.move_1_type = WDR.Emotes[WDR.Master.Moves[Sighting_Embed.move_1].type.toLowerCase()];
  Sighting_Embed.move_2_type = WDR.Emotes[WDR.Master.Moves[Sighting_Embed.move_2].type.toLowerCase()];

  // DETERMINE HEIGHT, WEIGHT AND SIZE
  Sighting_Embed.height = Math.floor(Sighting_Embed.height * 100) / 100;
  Sighting_Embed.weight = Math.floor(Sighting_Embed.weight * 100) / 100;
  Sighting_Embed.size = await WDR.Capitalize(Sighting_Embed.size)

  // POKEMON STATS
  Sighting_Embed.atk = Sighting_Embed.individual_attack;
  Sighting_Embed.def = Sighting_Embed.individual_defense;
  Sighting_Embed.sta = Sighting_Embed.individual_stamina;
  Sighting_Embed.lvl = Sighting_Embed.pokemon_level;
  Sighting_Embed.gen = Sighting_Embed.Gen

  // LINK VARIABLES
  Sighting_Embed.google = "[Google Maps](https://www.google.com/maps?q=" + Sighting_Embed.latitude + "," + Sighting_Embed.longitude + ")";
  Sighting_Embed.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + Sighting_Embed.latitude + "," + Sighting_Embed.longitude + "&z=10&t=s&dirflg=d)";
  Sighting_Embed.waze = "[Waze](https://www.waze.com/ul?ll=" + Sighting_Embed.latitude + "," + Sighting_Embed.longitude + "&navigate=yes)";
  Sighting_Embed.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + Sighting_Embed.latitude + "&lon=" + Sighting_Embed.longitude + "&zoom=15)";
  Sighting_Embed.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + Sighting_Embed.latitude + "/" + Sighting_Embed.longitude + "/15)";

  Sighting_Embed.body = await WDR.Generate_Tile(WDR, "pokemon", Sighting_Embed.lat, Sighting_Embed.lon, Sighting_Embed.sprite);
  Sighting_Embed.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + Sighting_Embed.body;

  //LOG TILE IF enabled
  if (WDR.Debug.Map_Tiles == "ENABLED") {
    console.log(Sighting_Embed.static_map);
  }

  // TIME VARIABLES
  Sighting_Embed.verified = Sighting_Embed.disappear_time_verified ? WDR.Emotes.checkYes : WDR.Emotes.yellowQuestion;
  Sighting_Embed.time = WDR.Time(Sighting_Embed.disappear_time, "1", Sighting_Embed.Timezone);
  Sighting_Embed.mins = Math.floor((Sighting_Embed.disappear_time - (Sighting_Embed.Time_Now / 1000)) / 60);
  Sighting_Embed.secs = Math.floor((Sighting_Embed.disappear_time - (Sighting_Embed.Time_Now / 1000)) - (Sighting_Embed.mins * 60));

  // CHECK IF TARGET IS A MEMBER OR A CHANNEL
  // if (HasIV == false || (Sighting_Embed.cp == null && WDR.Config.Sighting_Embed.sub_without_iv == "ENABLED")) {
  //   let NoIV_Embed = await Embed_Config(WDR, Sighting_Embed);
  //
  //   // CHECK IF TARGET IS A MEMBER OR A CHANNEL
  //   if (Sighting_Embed.Member) {
  //     if (WDR.Config.TIME_REWDR_SUBS && Sighting_Embed.mins < WDR.Config.TIME_REWDR_SUBS) {
  //       return;
  //     }
  //     if (WDR.Config.VERBOSE_LOGS == "ENABLED") {
  //       console.log("[EMBEDS] [" + WDR.Time(null, "stamp") + "] [Sighting_Embed.js] Sent a " + Sighting_Embed.name + " to " + Sighting_Embed.Member.user.tag + " (" + Sighting_Embed.Member.id + ").");
  //     }
  //     return WDR.Send_DM(WDR, NoIV_Embed, User.bot);
  //
  //   } else {
  //     if (WDR.Config.TIME_REWDR && Sighting_Embed.mins < WDR.Config.TIME_REWDR) {
  //       return;
  //     }
  //     if (WDR.Config.VERBOSE_LOGS == "ENABLED") {
  //       console.log("[EMBEDS] [" + WDR.Time(null, "stamp") + "] [Sighting_Embed.js] Sent a " + Sighting_Embed.name + " to " + Channel.guild.name + " (" + Channel.id + ").");
  //     }
  //     return WDR.Send_Embed(WDR, NoIV_Embed, Channel.id);
  //   }
  // } else {

  // RETURN FOR NULL CP
  if (Sighting_Embed.cp == null) {
    return;
  }

  if (User && Sighting_Embed.pokemon_id == 132) {
    console.log(">>>>TEST5<<<<< | " + Sighting_Embed.pokemon_name + " | " + Sighting_Embed.internal_value + " | User " + User.user_id);
  } else if (Sighting_Embed.pokemon_id == 132) {
    console.log(">>>>TEST5<<<<< | " + Sighting_Embed.pokemon_name + " | " + Sighting_Embed.internal_value + " | Channel " + Channel.id);
  }

  // CREATE AND SEND EMBED
  let IV_Embed = Embed_Config(WDR, Sighting_Embed);
  if (WDR.Debug.Processing_Speed == "ENABLED") {
    let difference = Math.round((new Date().getTime() - Sighting_Embed.WDR_Received) / 10) / 100;
    IV_Embed.setFooter("Latency: " + difference + "s");
  }

  // CHECK IF TARGET IS A MEMBER OR A CHANNEL
  if (Sighting_Embed.Member) {
    //console.log("[EMBEDS] [" + WDR.Time(null, "stamp") + "] [Sighting_Embed.js] Sent a " + Sighting_Embed.name + " to " + Sighting_Embed.Member.user.tag + " (" + Sighting_Embed.Member.id + ").");
    return WDR.Send_DM(WDR, Sighting_Embed.Discord.id, Sighting_Embed.Member.id, IV_Embed, User.bot);
  } else {
    if (WDR.Config.VERBOSE_LOGS == "ENABLED") {
      console.log("[EMBEDS] [" + WDR.Time(null, "stamp") + "] [Sighting_Embed.js] Sent a " + Sighting_Embed.name + " to " + Channel.guild.name + " (" + Channel.id + ").");
    }
    return WDR.Send_Embed(WDR, IV_Embed, Channel.id);
  }
  //}
}