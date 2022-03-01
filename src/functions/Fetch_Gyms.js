module.exports = (WDR, lat, lon) => {
    return new Promise(resolve => {

        let top_left = (lat + 0.00489) + ' ' + (lon - 0.01038);
        let top_right = (lat + 0.00489) + ' ' + (lon + 0.01038);
        let bottom_right = (lat - 0.00489) + ' ' + (lon - 0.01038);
        let bottom_left = (lat - 0.00489) + ' ' + (lon + 0.01038);

        let query = `
            SELECT
                raid_level,
                raid_pokemon_id,
                raid_pokemon_form,
                lat,
                lon,
                team_id,
                POW(69.1 * (lat - ${lat}), 2) + POW(69.1 * (${lon} - lon) * COS(lat / 57.3), 2) AS distance
            FROM
                gym
            WHERE
                lat != ${lat}
                    AND
                lon != ${lon}
                    AND
                ST_CONTAINS(
                    ST_GEOMFROMTEXT(
                        'POLYGON(( ${top_left}, ${top_right}, ${bottom_right}, ${bottom_left}, ${top_left} ))'
                    ),
                    point(gym.lat, gym.lon)
                )
            ORDER BY distance ASC LIMIT 20
        ;`;

        WDR.scannerDB.query(
            query,
            async function(err, results) {
                if (err) {
                    WDR.Console.log(WDR, '[Get_Gyms.js]', [query, err]);
                } else if (results.length < 1) {
                    if (!WDR.Config.TILE_PROVIDER || WDR.Config.TILE_PROVIDER == 'flo') {
                        return resolve('[]');
                    } else {
                        return resolve([]);
                    }
                } else {

                    let gymarray;
                    if (!WDR.Config.TILE_PROVIDER || WDR.Config.TILE_PROVIDER == 'flo') {
                        gymarray = '[';
                    } else {
                        gymarray = [];
                    }

                    for (let g = 0, rlen = results.length; g < rlen; g++) {
                        let result = results[g],
                            boss_sprite = '',
                            gym_sprite = '',
                            raid_pokemon_id = result.raid_pokemon_id ? result.raid_pokemon_id : 0,
                            raid_pokemon_form = result.raid_pokemon_form ? result.raid_pokemon_form : 0;

                        switch (parseInt(result.team_id)) {
                            case 1:
                                gym_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Mystic.png';
                                break;
                            case 2:
                                gym_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Valor.png';
                                break;
                            case 3:
                                gym_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Instinct.png';
                                break;
                            default:
                                gym_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Uncontested.png';
                        }

                        if (raid_pokemon_id > 0) {
                            boss_sprite = await WDR.Get_Sprite(WDR, {
                                type: 'Fetch_Gyms',
                                pokemon_id: raid_pokemon_id,
                                form: raid_pokemon_form
                            });
                        } else {
                            switch (parseInt(result.raid_level)) {
                                case 1:
                                case 2:
                                    boss_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Egg_Common_Tiles.png';
                                    break;
                                case 3:
                                case 4:
                                    boss_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Egg_Rare_Tiles.png';
                                    break;
                                case 5:
                                    boss_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Egg_Lengendary_Tiles.png';
                                    break;
                                default:

                                    switch (parseInt(result.team_id)) {
                                        case 1:
                                            boss_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/teams/Shield_Mystic.png';
                                            break;
                                        case 2:
                                            boss_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/teams/Shield_Valor.png';
                                            break;
                                        case 3:
                                            boss_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/teams/Shield_Instinct.png';
                                            break;
                                        default:
                                            boss_sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/teams/Shield_Uncontested.png';
                                    }
                            }
                        }
                        if ((result.lat != lat) && (result.lon != lon)) {
                            if (!WDR.Config.TILE_PROVIDER || WDR.Config.TILE_PROVIDER == 'flo') {
                                if (g != (results.length - 1)) {
                                    gymarray += '[' + result.lat + ',' + result.lon + ',' + '"' + gym_sprite + '"' + ',' + '"' + boss_sprite + '"' + ']' + ',';
                                } else {
                                    gymarray += '[' + result.lat + ',' + result.lon + ',' + '"' + gym_sprite + '"' + ',' + '"' + boss_sprite + '"' + ']]';
                                }
                            } else {
                                gymarray.push({
                                    lat: result.lat,
                                    lon: result.lon,
                                    marker: gym_sprite
                                });
                            }
                        }
                    }
                    return resolve(gymarray);
                }
            }
        );
    });
};