module.exports = (WDR, Payload) => {

  Payload.forEach(data => {

    // LOOP DISCORDS TO MATCH A GEOFENCE
    WDR.Discords.forEach(async discord => {

      // ASSIGN DISCORD TO VARIABLE
      data.message.Discord = discord;

      // CHECK GEOFENCES TO FIND A MATCH
      if (WDR.InsideGeojson.polygon(data.message.Discord.geofence, [data.message.longitude, data.message.latitude])) {

        // GET TIME
        data.message.Time_Now = new Date().getTime();

        // DEFINE AND DETERMINE TIMEZONE
        data.message.Timezone = WDR.GeoTz(data.message.Discord.geofence[0][1][1], data.message.Discord.geofence[0][1][0])[0];

        // DEFINE AREAS FROM GEOFENCE FILE
        data.message.Area = {};
        data.message.Area.Default = data.message.Discord.name;

        // CHECK IF GEOJSON EXISTS
        if (data.message.Discord.geojson_file && data.message.Discord.geojson_file != "") {

          // FETCH GEOFENCE OF DISCORD
          let geofences = await WDR.Geofences.get(data.message.Discord.geojson_file);

          if (!geofences) {
            console.log(("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [wdr.js] Geofence " + data.message.Discord.geojson_file + " does not appear to exist. WTF man.").bold.brightGreen);
          } else {

            // LOOP GEOFENCES TO FIND MATCH
            let g_len = geofences.length;
            for (let g = 0; g < g_len; g++) {

              // ASSIGN TO VARIABLE
              let geo = geofences[g];

              // GET IF POINT IS INSIDE A GEOFENCE
              if (WDR.InsideGeojson.feature({
                  features: [geo]
                }, [data.message.longitude, data.message.latitude]) != -1) {
                if (geo.properties.sub_area == "true") {
                  data.message.Area.Sub = geo.properties.name;
                } else {
                  data.message.Area.Main = geo.properties.name;
                }
              }
            }
          }
        }

        // ASSIGN AREA TO VARIABLES
        if (data.message.Area.Sub) {
          data.message.Area.Embed = data.message.Area.Sub;
        } else if (data.message.Area.Main && !data.message.Area.Sub) {
          data.message.Area.Embed = data.message.Area.Main;
        } else if (!data.message.Area.Sub && !data.message.Area.Main) {
          data.message.Area.Embed = data.message.Area.Default;
        }

        // GET RECEIVE TIME FOR PROCESSING TIME
        if (WDR.Config.DEBUG.Processing_Speed == "ENABLED") {
          data.message.WDR_Received = new Date().getTime();
        }

        // SEND TO OBJECT MODULES
        if (data.type == "pokemon") {

          if (data.message.cp > 0) {

            data.message.gen = await WDR.Get_Gen(data.message.pokemon_id);

            data.message.size = await WDR.Get_Size(WDR, data.message.pokemon_id, data.message.form, data.message.height, data.message.weight);

            data.message.weather_boost = await WDR.Get_Weather(WDR, data.message);

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
            data.message.great_league = await WDR.PvP.CalculatePossibleCPs(WDR, data.message.pokemon_id, data.message.form_id, data.message.individual_attack, data.message.individual_defense, data.message.individual_stamina, data.message.pokemon_level, data.message.gender_name, "great");

            // GET ULTRA LEAGUE STATS
            data.message.ultra_league = await WDR.PvP.CalculatePossibleCPs(WDR, data.message.pokemon_id, data.message.form_id, data.message.individual_attack, data.message.individual_defense, data.message.individual_stamina, data.message.pokemon_level, data.message.gender_name, "ultra");

            // SEND TO POKEMON SUBSCRIPTION FILTERING
            //WDR.Subscriptions.PvP(WDR, data.message);

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