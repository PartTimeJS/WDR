module.exports = async (WDR, user, channel, pvp) => {

  let Embed_Config = require(WDR.dir + "/configs/embeds/" + pvp.Embed_File);

  // CHECK IF THE TARGET IS A user
  if (user) {
    pvp.Member = WDR.Bot.guilds.cache.get(pvp.Discord.id).members.cache.get(Target.user_id);
  }

  if (channel.Filter.league.toLowerCase() == "ultra") {
    console.log("data1", pvp.possible_cps);
  }

  pvp.typing = await WDR.Get_Typing(WDR, {
    pokemon_id: pvp.pokemon_id,
    form: pvp.form
  });
  pvp.type = pvp.typing.type;
  pvp.type_noemoji = pvp.typing.type_noemoji;
  pvp.color = pvp.typing.color;

  if (channel.Filter.league.toLowerCase() == "ultra") {
    console.log("data2", pvp.possible_cps);
  }

  pvp.name = pvp.pokemon_name;

  pvp.form = pvp.form_name ? pvp.form_name : "";
  pvp.form = pvp.form_name == "[Normal]" ? "" : pvp.form_name;

  pvp.id = pvp.pokemon_id;

  pvp.sprite = WDR.Get_Sprite(WDR, pvp);
  pvp.iv = pvp.internal_value;

  pvp.lat = pvp.latitude;
  pvp.lon = pvp.longitude;

  pvp.area = pvp.Area.Embed;

  pvp.map_url = WDR.Config.FRONTEND_URL;

  // DETERMINE HEIGHT, WEIGHT AND SIZE
  pvp.height = Math.floor(pvp.height * 100) / 100;
  pvp.weight = Math.floor(pvp.weight * 100) / 100;

  // POKEMON STATS
  pvp.atk = pvp.individual_attack;
  pvp.def = pvp.individual_defense;
  pvp.sta = pvp.individual_stamina;
  pvp.lvl = pvp.pokemon_level;
  pvp.gen = pvp.Gen

  // DETERMINE MOVE NAMES AND TYPES
  pvp.move_1_type = WDR.Emotes[WDR.Master.Moves[pvp.move_1].type.toLowerCase()];
  pvp.move_2_type = WDR.Emotes[WDR.Master.Moves[pvp.move_2].type.toLowerCase()];

  // DETERMINE HEIGHT, WEIGHT AND SIZE
  pvp.height = Math.floor(pvp.height * 100) / 100;
  pvp.weight = Math.floor(pvp.weight * 100) / 100;

  // LINK VARIABLES
  pvp.google = "[Google Maps](https://www.google.com/maps?q=" + pvp.latitude + "," + pvp.longitude + ")";
  pvp.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + pvp.latitude + "," + pvp.longitude + "&z=10&t=s&dirflg=d)";
  pvp.waze = "[Waze](https://www.waze.com/ul?ll=" + pvp.latitude + "," + pvp.longitude + "&navigate=yes)";
  pvp.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + pvp.latitude + "&lon=" + pvp.longitude + "&zoom=15)";
  pvp.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + pvp.latitude + "/" + pvp.longitude + "/15)";

  // TIME VARIABLES
  pvp.verified = pvp.disappear_time_verified ? WDR.Emotes.checkYes : WDR.Emotes.yellowQuestion;
  pvp.time = WDR.Time(pvp.disappear_time, "1", pvp.Timezone);
  pvp.mins = Math.floor((pvp.disappear_time - (pvp.Time_Now / 1000)) / 60);
  pvp.secs = Math.floor((pvp.disappear_time - (pvp.Time_Now / 1000)) - (pvp.mins * 60));

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

  // pvp RANK AND EVO STRING
  pvp.ranks = "";
  pvp.possible_cps.forEach(rank_cp => {
    pvp.ranks += "Rank " + rank_cp.rank + " (" + WDR.Master.Pokemon[rank_cp.pokemon_id].name + ")\n";
  });

  pvp.pvp_data = "";

  if (WDR.Debug.Processing_Speed == "ENABLED") {
    let difference = Math.round((new Date().getTime() - pvp.WDR_Received) / 10) / 100;
    pvp.footer = "Latency: " + difference + "s";
  }

  // CREATE AND SEND EMBED
  pvp.Embed = Embed_Config(WDR, pvp);

  if (!pvp.Embed.image) {
    pvp.body = await WDR.Generate_Tile(WDR, "pokemon", pvp.lat, pvp.lon, pvp.sprite);
    pvp.Embed.image = {
      url: WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + pvp.body
    };
  }

  if (user) {
    WDR.Send_DM(WDR, pvp.Discord.id, pvp.Member.id, pvp.Embed, user.bot);
  } else {
    WDR.Send_Embed(WDR, pvp.Embed, channel.id);
  }

  // END
  return;
}