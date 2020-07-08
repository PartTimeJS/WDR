module.exports = async (WDR, Sighting) => {

  // let Create_Sub_Embed = require(__dirname + "/../embeds/pokemon.js");
  //
  // Sighting.form_id = Sighting.form_id ? Sighting.form_id : 0;
  //
  // let size = Sighting.size == 0 ? Sighting.size : Sighting.size.toLowerCase();
  //
  // let leagues = ["ultra", "great"];
  // let cps = [1000, 2000];
  //
  // leagues.forEach((league, index) => {
  //
  //   let pvp = {};
  //
  //   pvp.possible_cps = [];
  //
  //   pvp.league = league;
  //
  //   // CHECK FILTER GEOFENCES
  //   if (Sighting.Area.Default || Sighting.Area.Main || Sighting.Area.Sub) {
  //
  //     Sighting[pvp.league + "_league"].forEach(potential => {
  //       let rankMatch = potential.rank <= 10;
  //       let cpMatch = potential.cp >= cps[index];
  //       if (rankMatch && cpMatch) {
  //         let match = {};
  //         match.pokemon_id = potential.pokemon_id;
  //         match.rank = potential.rank;
  //         match.percent = potential.percent;
  //         match.level = potential.level;
  //         match.cp = potential.cp;
  //         match.value = potential.pvp_value;
  //         match.form_id = potential.form_id;
  //         pvp.possible_cps.push(match);
  //       }
  //     });
  //
  //     if (pvp.possible_cps.length > 0) {
  //
  //       pvp.possible_cps.forEach(ppvp => {
  //
  //         let query = `
  //           SELECT
  //               *
  //           FROM
  //               wdr_subscriptions
  //           WHERE
  //               status = 1
  //               sub_type = 'pvp'
  //               AND (pokemon_id = ${Sighting.pokemon_id} OR pokemon_id  = 0)
  //               AND (form = ${Sighting.form_id} OR form = 0)
  //               AND (league = ${league} OR league = 0)
  //               AND min_rank <= ${ppvp.rank}
  //               AND min_lvl <= ${Sighting.pokemon_level}
  //               AND min_cp <= ${Sighting.cp}
  //               AND (generation = ${Sighting.gen} OR generation = 0);`;
  //
  //         WDR.wdrDB.query(
  //           `SELECT
  //               *
  //            FROM
  //               wdr_subscriptions
  //            WHERE
  //               status = 1
  //               sub_type = 'pvp'
  //               AND (pokemon_id = ${Sighting.pokemon_id} OR pokemon_id  = 0)
  //               AND (form = ${Sighting.form_id} OR form = 0)
  //               AND (league = ${league} OR league = 0)
  //               AND min_rank <= ${Sighting.internal_value}
  //               AND min_lvl <= ${Sighting.pokemon_level}
  //               AND (generation = ${Sighting.gen} OR generation = 0);`,
  //           async function(error, matching, fields) {
  //             if (error) {
  //               console.log(("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pokemon.js] Error Querying Subscriptions.\n").bold.brightRed);
  //               console.error(query);
  //               return console.error(error);
  //             } else if (matching && matching[0]) {
  //
  //               let m_len = matching.length;
  //               for (let m = 0; m < mlen; m++) {
  //
  //                 let User = matching[m];
  //
  //                 let defGeo = (User.geofence.indexOf(Sighting.Area.Default) >= 0);
  //                 let mainGeo = (User.geofence.indexOf(Sighting.Area.Default) >= 0);
  //                 let subGeo = (User.geofence.indexOf(Sighting.Area.Sub) >= 0);
  //
  //                 // CHECK FILTER GEOFENCES
  //                 if (defGeo || mainGeo || subGeo) {
  //                   Sighting.Embed = matching[0].embed ? matching[0].embed : "pokemon_iv.js";
  //                   Send_Subscription(WDR, Sighting, User);
  //                 } else {
  //                   let values = User.geofence.split(";");
  //                   if (values.length == 3) {
  //                     let distance = await WDR.Get_Distance(WDR, {
  //                       lat1: Sighting.latitude,
  //                       lon1: Sighting.longitude,
  //                       lat2: values[0],
  //                       lon2: values[1]
  //                     });
  //                     if (distance <= values[2]) {
  //                       Send_Subscription(WDR, Sighting, User);
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         );
  //       });
  //     }
  //   }
  // });

  // END
  return;
}

async function Send_Subscription(WDR, Sighting, User) {
  let Embed_Config = require(WDR.dir + "/configs/embeds/pvp_sub.js");

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

  pvp.gender_wemoji = Sighting.gender_wemoji;
  pvp.gender_noemoji = Sighting.gender_noemoji;

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
  pvp.size = await WDR.Capitalize(Sighting.size);

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