module.exports = (WDR, lat, lon) => {
    return new Promise(resolve => {

        let top_left = (lat + 0.00489) + ' ' + (lon - 0.01038);
        let top_right = (lat + 0.00489) + ' ' + (lon + 0.01038);
        let bottom_right = (lat - 0.00489) + ' ' + (lon - 0.01038);
        let bottom_left = (lat - 0.00489) + ' ' + (lon + 0.01038);

        let query = `
      SELECT
          grunt_type,
          quest_reward_type,
          quest_pokemon_id,
          quest_item_id,
          quest_rewards,
          lat,
          lon,
          POW(69.1 * (lat - ${lat}), 2) + POW(69.1 * (${lon} - lon) * COS(lat / 57.3), 2) AS distance
      FROM
          pokestop
      WHERE
          lat != ${lat}
            AND
          lon != ${lon}
            AND
          ST_CONTAINS(
              ST_GEOMFROMTEXT(
                  'POLYGON(( ${top_left}, ${top_right}, ${bottom_right}, ${bottom_left}, ${top_left} ))'
              ),
              point(pokestop.lat, pokestop.lon)
          )
      ORDER BY distance ASC LIMIT 30
    ;`;
        WDR.scannerDB.query(
            query,
            async function (err, results) {
                if (err) {
                    WDR.Console.log(WDR, '[Fetch_Stops.js]', [query, err]);
                } else if (results.length < 1) {
                    if (!WDR.Config.TILE_PROVIDER || WDR.Config.TILE_PROVIDER == 'flo') {
                        return resolve('[]');
                    } else {
                        return resolve([]);
                    }
                } else {

                    let stoparray;
                    if (!WDR.Config.TILE_PROVIDER || WDR.Config.TILE_PROVIDER == 'flo') {
                        stoparray = '[';
                    } else {
                        stoparray = [];
                    }

                    for (let p = 0; p < results.length; p++) {
                        let result = results[p],
                            quest_item_id = result.quest_item_id ? result.quest_item_id : 0,
                            quest_pokemon_id = result.quest_pokemon_id ? result.quest_pokemon_id : 0,
                            quest_pokemon_form = result.quest_pokemon_form ? result.quest_pokemon_form : 0;
                        result.quest_rewards = JSON.parse(result.quest_rewards);

                        let stop_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/other/tile_pokestop.png';
                        if (result.grunt_type > 0) {
                            stop_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/other/tile_rocketstop.png';
                        }

                        let reward_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/other/blank.png';
                        if (quest_pokemon_id > 0) {
                            reward_sprite = await WDR.Get_Sprite(WDR, {
                                type: 'Fetch_Stops.js - Pokemon Reward',
                                pokemon_id: quest_pokemon_id,
                                form: quest_pokemon_form
                            });
                        }
                        if (quest_item_id > 0) {
                            reward_sprite = await WDR.Get_Sprite(WDR, {
                                type: 'Fetch_Stops.js - Item Reward',
                                rewards: [{
                                    type: result.quest_reward_type,
                                    info: {
                                        item_id: result.quest_rewards[0].info.item_id,
                                        amount: result.quest_rewards[0].info.amount
                                    }
                                }]
                            });
                        }
                        if (!reward_sprite) {
                            reward_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/other/blank.png';
                        }

                        if ((result.lat != lat) && (result.lon != lon)) {
                            if (!WDR.Config.TILE_PROVIDER || WDR.Config.TILE_PROVIDER == 'flo') {
                                if (p != results.length - 1) {
                                    stoparray += '[' + result.lat + ',' + result.lon + ',' + '"' + stop_sprite + '"' + ',' + '"' + reward_sprite + '"' + ']' + ',';
                                } else {
                                    stoparray += '[' + result.lat + ',' + result.lon + ',' + '"' + stop_sprite + '"' + ',' + '"' + reward_sprite + '"' + ']]';
                                }
                            } else {
                                stoparray.push({
                                    lat: result.lat,
                                    lon: result.lon,
                                    marker: stop_sprite
                                });
                            }
                        }
                    }
                    return resolve(stoparray);
                }
            }
        );
    });
};