// const data_types = ["pokemon", "raid", "quest", "pokestop", "invasion"];

// class Webhook {
//     constructor(data) {
//         console.log(data);
//     }

//     Parse() {

//         if (data_types.includes(data.type)) {

//             for (let d = 0, dlen = WDR.Discords.length; d < dlen; d++) {

//                 let object = data.message;

//                 object.discord = WDR.Discords[d];

//                 if (WDR.PointInGeoJSON.polygon(object.discord.geofence, [object.longitude, object.latitude])) {

//                     object.time_now = new Date().getTime();

//                     object.timezone = WDR.GeoTz(object.discord.geofence[0][1][1], object.discord.geofence[0][1][0])[0];

//                     object.area = {};
//                     object.area.default = object.discord.name;

//                     if (object.discord.geojson_file && object.discord.geojson_file != "") {
//                         object.area = await WDR.Get_Areas(WDR, object);
//                     }

//                     if (object.area.sub) {
//                         object.area.embed = object.area.sub;
//                     } else if (object.area.main && !object.area.sub) {
//                         object.area.embed = object.area.main;
//                     } else if (!object.area.sub && !object.area.main) {
//                         object.area.embed = object.area.default;
//                     }

//                     if (WDR.Config.DEBUG.Processing_Speed == "ENABLED") {
//                         object.WDR_Received = new Date().getTime();
//                     }

//                     if (data.type == "pokemon") {

//                         if (object.cp > 0) {

//                             object.gen = await WDR.Get_Gen(object.pokemon_id);

//                             object.weather_boost = await WDR.Get_Weather(WDR, object);
//                             if (object.weather_boost == undefined) {
//                                 WDR.Console.error(WDR, "[handlers/webhooks.js] Undefined Emoji for Weather ID " + object.weather + ". Emoji does not exist in defined emoji server(s).");
//                             }

//                             object.size = await WDR.Get_Size(WDR, object.pokemon_id, object.form, object.height, object.weight);

//                             object = await WDR.Get_Locale.Pokemon(WDR, object);

//                             object.internal_value = (Math.floor(((object.individual_defense + object.individual_stamina + object.individual_attack) / 45) * 1000) / 10);

//                             if (object.gender == 1) {
//                                 object.gender_name = "male";
//                                 object.gender_id = 1;
//                             } else if (object.gender == 2) {
//                                 object.gender_name = "female";
//                                 object.gender_id = 2;
//                             } else {
//                                 delete object.gender;
//                                 object.gender_name = "all";
//                                 object.gender_id = 0;
//                             }
//                             if (object.gender) {
//                                 object.gender_wemoji = await WDR.Capitalize(object.gender_name) + " " + WDR.Emotes[object.gender_name];
//                                 object.gender_noemoji = await WDR.Capitalize(object.gender_name);
//                             }

//                             WDR.Subscriptions.Pokemon(WDR, object);

//                             WDR.Feeds.Pokemon(WDR, object);

//                             // if (object.pvp_rankings_great_league) {
//                             //     object.great_league = object.pvp_rankings_great_league;
//                             // } else {
//                             object.great_league = await WDR.PvP.CalculatePossibleCPs(WDR, object.pokemon_id, object.form_id, object.individual_attack, object.individual_defense, object.individual_stamina, object.pokemon_level, object.gender_name, "great", "webhook.js great");
//                             // }

//                             // if (object.pvp_rankings_ultra_league) {
//                             //     object.ultra_league = object.pvp_rankings_great_league;
//                             // } else {
//                             object.ultra_league = await WDR.PvP.CalculatePossibleCPs(WDR, object.pokemon_id, object.form_id, object.individual_attack, object.individual_defense, object.individual_stamina, object.pokemon_level, object.gender_name, "ultra", "webhook.js ultra");
//                             // }

//                             WDR.Subscriptions.PvP(WDR, object);

//                             WDR.Feeds.PvP(WDR, object);

//                         } else {
//                             //WDR.Feeds.NoIVPokemon(WDR, object);
//                             //WDR.Subscriptions.NoIVPokemon(WDR, object);
//                         }

//                     } else if (data.type == "raid") {

//                         if (!Reported_Raids.includes(object.gym_id)) {

//                             Reported_Raids.push(object.gym_id);

//                             object = await WDR.Get_Locale.Pokemon(WDR, object);

//                             WDR.Feeds.Raids(WDR, object);

//                             WDR.Subscriptions.Raids(WDR, object);

//                         }
//                     } else if (data.type == "quest") {

//                         if (!Reported_Quests.includes(object.pokestop_id)) {
//                             Reported_Quests.push(object.pokestop_id);

//                             object = await WDR.Get_Quest_Reward(WDR, object);

//                             if (!object) {
//                                 return WDR.Cosole.error(WDR, "[webhooks.js] Quest object lost when trying to get Reward", data.message)
//                             }

//                             object = await WDR.Get_Quest_Task(WDR, object);

//                             if (!object) {
//                                 return WDR.Cosole.error(WDR, "[webhooks.js] Quest object lost when trying to get Task", data.message)
//                             }

//                             WDR.Feeds.Quests(WDR, object);

//                             WDR.Subscriptions.Quests(WDR, object);
//                         }

//                     } else if (data.type == "pokestop") {

//                         if (!Reported_Lures.includes(object.pokestop_id)) {
//                             Reported_Lures.push(object.pokestop_id);

//                             WDR.Feeds.Lures(WDR, object);

//                             //WDR.Subscriptions.Lures(WDR, object);

//                         }
//                     } else if (data.type == "invasion") {

//                         if (!Reported_Invasions.includes(object.pokestop_id)) {
//                             Reported_Invasions.push(object.pokestop_id);

//                             WDR.Feeds.Invasions(WDR, object);

//                             //WDR.Subscriptions.Invasions(WDR, object);
//                         }
//                     }
//                 }
//             }
//         }
//     } //);

//     // END
//     return;
// }