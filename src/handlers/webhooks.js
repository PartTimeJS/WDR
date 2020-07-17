module.exports = (WDR, Payload) => {

  Payload.forEach(data => {

    // LOOP DISCORDS TO MATCH A GEOFENCE
    WDR.Discords.forEach(async discord => {

      let payload = {};

      // ASSIGN DISCORD TO VARIABLE
      data.message.Discord = discord;

      // CHECK GEOFENCES TO FIND A MATCH
      if (WDR.PointInGeoJSON.polygon(data.message.Discord.geofence, [data.message.longitude, data.message.latitude])) {

        // GET TIME
        data.message.Time_Now = new Date().getTime();

        // DEFINE AND DETERMINE TIMEZONE
        data.message.Timezone = WDR.GeoTz(data.message.Discord.geofence[0][1][1], data.message.Discord.geofence[0][1][0])[0];

        // DEFINE AREAS FROM GEOFENCE FILE
        data.message.area = {};
        data.message.area.default = data.message.Discord.name;

        // CHECK IF GEOJSON EXISTS
        if (data.message.Discord.geojson_file && data.message.Discord.geojson_file != "") {
          data.message.area = await WDR.Get_Areas(WDR, data.message);
        }

        // ASSIGN AREA TO VARIABLES
        if (data.message.area.sub) {
          data.message.area.embed = data.message.area.sub;
        } else if (data.message.area.main && !data.message.area.sub) {
          data.message.area.embed = data.message.area.main;
        } else if (!data.message.area.sub && !data.message.area.main) {
          data.message.area.embed = data.message.area.default;
        }

        // GET RECEIVE TIME FOR PROCESSING TIME
        if (WDR.Config.DEBUG.Processing_Speed == "ENABLED") {
          data.message.WDR_Received = new Date().getTime();
        }

        // SEND TO OBJECT MODULES
        if (data.type == "pokemon") {

          if (data.message.cp > 0) {

            data.message.gen = await WDR.Get_Gen(data.message.pokemon_id);

            data.message.weather_boost = await WDR.Get_Weather(WDR, data.message);
            if (data.message.weather_boost == undefined) {
              WDR.Console.error(WDR, "[handlers/webhooks.js] Undefined Emoji for Weather ID " + data.message.weather + ". Emoji does not exist in defined emoji server(s).");
            }

            data.message.size = await WDR.Get_Size(WDR, data.message.pokemon_id, data.message.form, data.message.height, data.message.weight);

            data.message = await WDR.Get_Locale.Pokemon(WDR, data.message);

            data.message.internal_value = (Math.floor(((data.message.individual_defense + data.message.individual_stamina + data.message.individual_attack) / 45) * 1000) / 10);

            if (data.message.gender == 1) {
              data.message.gender_name = "male";
              data.message.gender_id = 1;
            } else if (data.message.gender == 2) {
              data.message.gender_name = "female";
              data.message.gender_id = 2;
            } else {
              delete data.message.gender;
              data.message.gender_name = "all";
              data.message.gender_id = 0;
            }
            if (data.message.gender) {
              data.message.gender_wemoji = await WDR.Capitalize(data.message.gender_name) + " " + WDR.Emotes[data.message.gender_name];
              data.message.gender_noemoji = await WDR.Capitalize(data.message.gender_name);
            }

            // SEND TO POKEMON SUBSCRIPTION PROCESSING
            WDR.Subscriptions.Pokemon(WDR, data.message);

            // SEND TO POKEMON FEED PROCESSING
            WDR.Feeds.Pokemon(WDR, data.message);

            // GET GREAT LEAGUE STATS
            data.message.great_league = await WDR.PvP.CalculatePossibleCPs(WDR, data.message.pokemon_id, data.message.form_id, data.message.individual_attack, data.message.individual_defense, data.message.individual_stamina, data.message.pokemon_level, data.message.gender_name, "great", "webhook.js great");

            // GET ULTRA LEAGUE STATS
            data.message.ultra_league = await WDR.PvP.CalculatePossibleCPs(WDR, data.message.pokemon_id, data.message.form_id, data.message.individual_attack, data.message.individual_defense, data.message.individual_stamina, data.message.pokemon_level, data.message.gender_name, "ultra", "webhook.js ultra");

            // SEND TO POKEMON SUBSCRIPTION FILTERING
            WDR.Subscriptions.PvP(WDR, data.message);

            // SEND TO POKEMON FEED FILTERING
            WDR.Feeds.PvP(WDR, data.message);
          } else {

            // SEND TO NO IV FEED
            //WDR.Feeds.NoIVPokemon(WDR, data.message);
            //WDR.Subscriptions.NoIVPokemon(WDR, data.message);
          }

        } else if (data.type == "raid") {

          data.message = await WDR.Get_Locale.Pokemon(WDR, data.message);

          // SEND TO RAID FEED FILTERING
          WDR.Feeds.Raids(WDR, data.message);

          // SEND TO RAID SUBSCRIPTION FILTERING
          //WDR.Subscriptions.Raids(WDR, data.message);

        } else if (data.type == "quest") {

          // GET QUEST REWARD
          data.message = await WDR.Get_Quest_Reward(WDR, data.message);

          // GET QUEST TASK
          data.message = await WDR.Get_Quest_Task(WDR, data.message);

          // SEND TO QUEST FEED FILTERING
          WDR.Feeds.Quests(WDR, data.message);

          // SEND TO QUEST SUBSCRIPTION FILTERING
          //WDR.Subscriptions.Quests(WDR, data.message);

        } else if (data.type == "pokestop") {

          // SEND TO LURE FEED FILTERING
          WDR.Feeds.Lures(WDR, data.message);

          // SEND TO LURE SUBSCRIPTION FILTERING
          //WDR.Subscriptions.Lures(WDR, data.message);

        } else if (data.type == "invasion") {

          // SEND TO INVASION FEED FILTERING
          WDR.Feeds.Invasions(WDR, data.message);

          // SEND TO INVASION SUBSCRIPTION FILTERING
          //WDR.Subscriptions.Invasions(WDR, data.message);
        }
      }
    });
  });

  // END
  return;
}

function Calculate_Size(pokemon_id) {
  let weightRatio = 0,
    heightRatio = 0;
  if (form_id > 0) {
    let form_weight = WDR.Master.Pokemon[pokemon_id].forms[form_id].weight ? WDR.Master.Pokemon[pokemon_id].forms[form_id].weight : WDR.Master.Pokemon[pokemon_id].weight;
    let form_height = WDR.Master.Pokemon[pokemon_id].forms[form_id].height ? WDR.Master.Pokemon[pokemon_id].forms[form_id].height : WDR.Master.Pokemon[pokemon_id].height;
    weightRatio = data.message.weight / form_weight;
    heightRatio = data.message.height / form_height;
  } else {
    weightRatio = data.message.weight / WDR.Master.Pokemon[pokemon_id].weight;
    heightRatio = data.message.height / WDR.Master.Pokemon[pokemon_id].height;
  }

  let size = heightRatio + weightRatio;

  switch (true) {
    case size < 1.5:
      return resolve('Tiny');
    case size <= 1.75:
      return resolve('Small');
    case size < 2.25:
      return resolve('Normal');
    case size <= 2.5:
      return resolve('Large');
    default:
      return resolve('Big');
  }
}