module.exports = async (WDR, Sighting) => {

  let S = Sighting;
  let Create_Sub_Embed = require(__dirname + "/../embeds/pokemon.js");

  S.form_id = S.form_id ? S.form_id : 0;

  let size = S.size == 0 ? S.size : S.size.toLowerCase();

  switch (true) {
    case (S.Area.Default != undefined):
    case (S.Area.Main != undefined):
    case (S.Area.Sub != undefined):

      let query = `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          status = 1
          AND (pokemon_id = ${S.pokemon_id} OR pokemon_id  = 0)
          AND (geofence LIKE '%${S.Area.Default}%' OR geofence LIKE '%${S.Area.Main}%' OR geofence LIKE '%${S.Area.Sub}%')
          AND (form = ${S.form_id} OR form = 0)
          AND min_iv <= ${S.internal_value}
          AND max_iv >= ${S.internal_value}
          AND min_lvl <= ${S.pokemon_level}
          AND max_lvl >= ${S.pokemon_level}
          AND (size = '${size}' OR size = 0)
          AND (gender = ${S.gender_id} OR gender = 0)
          AND (generation = ${S.gen} OR generation = 0);`;

      WDR.wdrDB.query(
        `SELECT
            *
         FROM
            wdr_subscriptions
         WHERE
            status = 1
            AND (pokemon_id = ${S.pokemon_id} OR pokemon_id  = 0)
            AND (geofence LIKE '%${S.Area.Default}%' OR geofence LIKE '%${S.Area.Main}%' OR geofence LIKE '%${S.Area.Sub}%')
            AND (form = ${S.form_id} OR form = 0)
            AND min_iv <= ${S.internal_value}
            AND max_iv >= ${S.internal_value}
            AND min_lvl <= ${S.pokemon_level}
            AND max_lvl >= ${S.pokemon_level}
            AND (size = '${size}' OR size = 0)
            AND (gender = ${S.gender_id} OR gender = 0)
            AND (generation = ${S.gen} OR generation = 0);`,
        function(error, matching, fields) {
          if (error) {
            console.log(("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pokemon.js] Error Querying Subscriptions.\n").bold.brightRed);
            console.error(query);
            return console.error(error);
          } else if (matching && matching[0]) {
            for (let m = 0, mlen = matching.length; m < mlen; m++) {
              S.Embed = matching[0].embed ? matching[0].embed : "pokemon_iv.js";
              let User = matching[m];
              Create_Sub_Embed(WDR, User, null, S);
            }
          }
        }
      );
  }

  // WDR.wdrDB.query(
  //   `SELECT
  //       *
  //    FROM
  //       wdr_subscriptions
  //    WHERE
  //       status = 1
  //       AND (pokemon_id  = ${S.pokemon_id} OR pokemon_id  = 0),
  //       AND (form  = ${S.form} OR form  = 0),
  //       AND min_iv <= ${S.internal_value},
  //       AND max_iv >= ${S.internal_value},
  //       AND min_lvl <= ${S.pokemon_level},
  //       AND max_lvl >= ${S.pokemon_level},
  //       AND (size = '${S.size.toLowerCase()}' OR size = 0),
  //       AND (gender = '${S.gender_id}' OR gender = 0),
  //       AND (generation = ${S.gen} OR generation = 0);`,
  //   async function(error, matching, fields) {
  //     if (matching && matching[0]) {
  //       for (let m = 0, mlen = matching.length; m < mlen; m++) {
  //         let Sub = matching[m];
  //         if (sub.distance > 0 && Sub.coords) {
  //           let distance = await get_distance(WDR, Sighting, Sub);
  //           if (distance < Sub.distance) {
  //             Create_Sub_Embed(WDR, Sub, Sighting);
  //           }
  //         }
  //       }
  //     }
  //   }
  // );

  // END
  return;
}

function get_distance(WDR, Sighting, User) {
  return new Promise(async resolve => {
    let coords = User.coords.split(",")[0]
    let spawn_loc = {
      lat: S.lat,
      lon: S.lon
    };
    let user_loc = {
      lat: coords[0],
      lon: coords[1]
    }
    let spawn_distance = WDR.Distance.between(spawn_loc, user_loc);
    return resolve(spawn_distance);
  });
}