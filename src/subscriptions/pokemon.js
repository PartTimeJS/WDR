module.exports = async (WDR, Sighting) => {

  Sighting.form_id = Sighting.form_id ? Sighting.form_id : 0;

  let size = Sighting.size == 0 ? Sighting.size : Sighting.size.toLowerCase();

  switch (true) {
    case (Sighting.area.default != undefined):
    case (Sighting.area.main != undefined):
    case (Sighting.area.sub != undefined):

      let query = `
        SELECT
            *
        FROM
            wdr_subscriptions
        WHERE
            status = 1
            AND sub_type = 'pokemon'
            AND (pokemon_id = ${Sighting.pokemon_id} OR pokemon_id  = 0)
            AND (form = ${Sighting.form_id} OR form = 0)
            AND min_iv <= ${Sighting.internal_value}
            AND max_iv >= ${Sighting.internal_value}
            AND min_lvl <= ${Sighting.pokemon_level}
            AND max_lvl >= ${Sighting.pokemon_level}
            AND (size = '${size}' OR size = 0)
            AND (gender = ${Sighting.gender_id} OR gender = 0)
            AND (generation = ${Sighting.gen} OR generation = 0);
      `;

      WDR.wdrDB.query(
        query,
        async function(error, matching, fields) {
          if (error) {
            WDR.Console.error("[commands/pokemon.js] Error Querying Subscriptions.", [query, error]);
          } else if (matching && matching[0]) {

            for (let m = 0, mlen = matching.length; m < mlen; m++) {
              let User = matching[m];

              let defGeo = (User.geofence.indexOf(Sighting.area.default) >= 0);
              let mainGeo = (User.geofence.indexOf(Sighting.area.main) >= 0);
              let subGeo = (User.geofence.indexOf(Sighting.area.sub) >= 0);

              // CHECK FILTER GEOFENCES
              if (defGeo || mainGeo || subGeo) {
                Send_Subscription(WDR, Sighting, User);
              } else {
                let values = User.geofence.split(";");
                if (values.length == 3) {
                  let coords = {
                    lat1: Sighting.latitude,
                    lon1: Sighting.longitude,
                    lat2: values[0],
                    lon2: values[1]
                  };
                  let distance = await WDR.Get_Distance(WDR, coords);
                  if (distance <= values[2]) {
                    Send_Subscription(WDR, Sighting, User);
                  }
                }
              }
            }
          }
        }
      );
  }

  // END
  return;
}

async function Send_Subscription(WDR, Sighting, User) {

  let match = {};

  match.embed = "pokemon_iv.js";

  let Embed_Config = require(WDR.Dir + "/configs/embeds/" + match.embed);

  match.typing = await WDR.Get_Typing(WDR, {
    pokemon_id: Sighting.pokemon_id,
    form: Sighting.form
  });

  match.sprite = WDR.Get_Sprite(WDR, {
    pokemon_id: Sighting.pokemon_id,
    form: Sighting.form_id
  });

  match.type = match.typing.type;
  match.type_noemoji = match.typing.type_noemoji;

  match.color = match.typing.color;

  match.name = Sighting.pokemon_name;
  match.id = Sighting.pokemon_id;
  match.form = Sighting.form_name ? Sighting.form_name : "";
  match.form = Sighting.form_name == "[Normal]" ? "" : Sighting.form_name;

  match.iv = Sighting.internal_value;
  match.cp = Sighting.cp;

  match.lat = Sighting.latitude;
  match.lon = Sighting.longitude;

  match.weather_boost = Sighting.weather_boost;

  match.area = Sighting.area.embed;

  match.map_url = WDR.Config.FRONTEND_URL;

  match.atk = Sighting.individual_attack;
  match.def = Sighting.individual_defense;
  match.sta = Sighting.individual_stamina;

  match.lvl = Sighting.pokemon_level;
  match.gen = Sighting.gen;

  match.move_1_type = WDR.Emotes[WDR.Master.Moves[Sighting.move_1].type.toLowerCase()];
  match.move_2_type = WDR.Emotes[WDR.Master.Moves[Sighting.move_2].type.toLowerCase()];
  match.move_1_name = Sighting.move_1_name;
  match.move_2_name = Sighting.move_2_name;

  match.height = Math.floor(Sighting.height * 100) / 100;
  match.weight = Math.floor(Sighting.weight * 100) / 100;
  match.size = await WDR.Capitalize(Sighting.size);

  match.google = "[Google Maps](https://www.google.com/maps?q=" + Sighting.latitude + "," + Sighting.longitude + ")";
  match.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + Sighting.latitude + "," + Sighting.longitude + "&z=10&t=s&dirflg=d)";
  match.waze = "[Waze](https://www.waze.com/ul?ll=" + Sighting.latitude + "," + Sighting.longitude + "&navigate=yes)";
  match.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + Sighting.latitude + "&lon=" + Sighting.longitude + "&zoom=15)";
  match.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + Sighting.latitude + "/" + Sighting.longitude + "/15)";

  match.verified = Sighting.disappear_time_verified ? WDR.Emotes.checkYes : WDR.Emotes.yellowQuestion;
  match.time = WDR.Time(Sighting.disappear_time, "1", Sighting.Timezone);
  match.mins = Math.floor((Sighting.disappear_time - (Sighting.Time_Now / 1000)) / 60);
  match.secs = Math.floor((Sighting.disappear_time - (Sighting.Time_Now / 1000)) - (match.mins * 60));

  if (match.mins >= 5) {

    match.body = await WDR.Generate_Tile(WDR, "pokemon", match.lat, match.lon, match.sprite);
    match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;

    if (WDR.Debug.Processing_Speed == "ENABLED") {
      let difference = Math.round((new Date().getTime() - Sighting.WDR_Received) / 10) / 100;
      match.footer = "Latency: " + difference + "s";
    }

    match.embed = Embed_Config(WDR, match);

    WDR.Send_DM(WDR, User.guild_id, User.user_id, match.embed, User.bot);

  }


}