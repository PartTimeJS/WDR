module.exports = async (WDR, Sighting) => {

  Sighting.form_id = Sighting.form_id ? Sighting.form_id : 0;

  let size = Sighting.size == 0 ? Sighting.size : Sighting.size.toLowerCase();

  let typing = await WDR.Get_Typing(WDR, {
    pokemon_id: Sighting.pokemon_id,
    form: Sighting.form,
    type: "type_array"
  });

  let query = `
    SELECT
        *
    FROM
        wdr_subscriptions
    WHERE
          status = 1
        AND
          sub_type = 'quest'
        AND
          (
            reward = ${Quest.pokemon_id}
              OR
            reward = ${Quest.simple_reward}
              OR
            reward = ${Quest.full_reward}
          )
  ;`;

  WDR.wdrDB.query(
    query,
    async function(error, matching, fields) {
      if (error) {
        WDR.Console.error(WDR, "[commands/pokemon.js] Error Querying Subscriptions.", [query, error]);
      } else if (matching && matching[0]) {

        Sighting.sprite = WDR.Get_Sprite(WDR, Sighting);

        if (WDR.Config.PVP_PREGEN_TILES != "DISABLED") {
          Sighting.body = await WDR.Generate_Tile(WDR, Sighting, "pokemon", Sighting.latitude, Sighting.longitude, Sighting.sprite);
          Sighting.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + Sighting.body;
        }

        for (let m = 0, mlen = matching.length; m < mlen; m++) {
          let User = matching[m];

          if (matching[0] == "areas" || matching[0].geotype == "city") {
            let defGeo = (User.areas.indexOf(Sighting.area.default) >= 0);
            let mainGeo = (User.areas.indexOf(Sighting.area.main) >= 0);
            let subGeo = (User.areas.indexOf(Sighting.area.sub) >= 0);
            if (defGeo || mainGeo || subGeo) {
              Send_Subscription(WDR, Sighting, User);
            }

          } else if (User.geotype == "location") {
            let values = User.location.split(";");
            let distance = WDR.Distance.between({
              lat: Sighting.latitude,
              lon: Sighting.longitude
            }, {
              lat: values[0].split(",")[0],
              lon: values[0].split(",")[1]
            });
            let loc_dist = WDR.Distance(values[1] + " km");
            if (loc_dist > distance) {
              Send_Subscription(WDR, Sighting, User);
            }
          }
        }
      }
    }
  );

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

  match.sprite = Sighting.sprite;

  match.body = Sighting.body;
  match.static_map = Sighting.static_map;

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

    if (WDR.Debug.Processing_Speed == "ENABLED") {
      let difference = Math.round((new Date().getTime() - Sighting.WDR_Received) / 10) / 100;
      match.footer = "Latency: " + difference + "s";
    }

    match.embed = Embed_Config(WDR, match);

    WDR.Send_DM(WDR, User.guild_id, User.user_id, match.embed, User.bot);

  }


}