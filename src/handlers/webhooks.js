const hash = require('object-hash');

var Seen_Pokemon = {};
var Seen_Raids = {};
setInterval(() => {
    let limit = new Date().getTime() - 3600000;
    for (const time in Seen_Pokemon) {
        if(Seen_Pokemon[time] <= limit){
            delete Seen_Pokemon[time];
        }
    }
    for (const time in Seen_Raids) {
        if(Seen_Raids[time] <= limit){
            delete Seen_Raids[time];
        }
    }
}, 60000 * 5);

module.exports = async (WDR, Payload) => {

    for (let p = 0, plen = Payload.length; p < plen; p++) {
        
        let objectType = Payload[p].type;
        
        //Payload.forEach(async data => {

        let dataTypes = ['pokemon', 'raid', 'quest', 'pokestop', 'invasion'];

        if (dataTypes.includes(objectType)) {

            for (let d = 0, dlen = WDR.Discords.length; d < dlen; d++) {

                if (WDR.PointInGeoJSON.polygon(WDR.Discords[d].geofence, [Payload[p].message.longitude, Payload[p].message.latitude])) {

                    let object = Payload[p].message;

                    object.discord = WDR.Discords[d];

                    if(WDR.Config.BLOCK_DUPLICATES == 'ENABLED' && !object.hash){
                        object.hash = hash(object);
                    }

                    object.time_now = new Date().getTime();

                    object.timezone = WDR.GeoTz(object.discord.geofence[0][1][1], object.discord.geofence[0][1][0])[0];

                    object.area = {};
                    object.area.default = object.discord.name;

                    if (object.discord.geojson_file && object.discord.geojson_file != '') {
                        object.area = await WDR.Get_Areas(WDR, object);
                    }

                    if (object.area.sub) {
                        object.area.embed = object.area.sub;
                    } else if (object.area.main && !object.area.sub) {
                        object.area.embed = object.area.main;
                    } else if (!object.area.sub && !object.area.main) {
                        object.area.embed = object.area.default;
                    }

                    if (WDR.Config.DEBUG.Processing_Speed == 'ENABLED') {
                        object.WDR_Received = new Date().getTime();
                    }

                    if (objectType === 'pokemon') {

                        if(object.hash){
                            if(Seen_Pokemon[object.hash] > 0){
                                continue;
                            } else {
                                Seen_Pokemon[object.hash] = object.time_now;
                            }  
                        }

                        if (object.cp > 0) {

                            object.gen = await WDR.Get_Gen(object.pokemon_id);

                            object.weather_boost = await WDR.Get_Weather(WDR, object);
                            if (object.weather_boost == undefined) {
                                WDR.Console.error(WDR, '[handlers/webhooks.js] Undefined Emoji for Weather ID ' + object.weather + '. Emoji does not exist in defined emoji server(s).');
                            }

                            object.size = await WDR.Get_Size(WDR, object.pokemon_id, object.form, object.height, object.weight);

                            object = await WDR.Get_Locale.Pokemon(WDR, object);

                            object.internal_value = (Math.floor(((object.individual_defense + object.individual_stamina + object.individual_attack) / 45) * 1000) / 10);

                            if (object.gender == 1) {
                                object.gender_name = 'male';
                                object.gender_id = 1;
                            } else if (object.gender == 2) {
                                object.gender_name = 'female';
                                object.gender_id = 2;
                            } else {
                                delete object.gender;
                                object.gender_name = 'all';
                                object.gender_id = 0;
                            }
                            if (object.gender) {
                                object.gender_wemoji = await WDR.Capitalize(object.gender_name) + ' ' + WDR.Emotes[object.gender_name];
                                object.gender_noemoji = await WDR.Capitalize(object.gender_name);
                            }

                            WDR.Subscriptions.Pokemon(WDR, object);

                            WDR.Feeds.Pokemon(WDR, object);

                            // if (object.pvp_rankings_great_league) {
                            //     object.great_league = object.pvp_rankings_great_league;
                            // } else {
                            object.great_league = await WDR.PvP.CalculatePossibleCPs(WDR, object.pokemon_id, object.form_id, object.individual_attack, object.individual_defense, object.individual_stamina, object.pokemon_level, object.gender_name, 'great', 'webhook.js great');
                            // }

                            // if (object.pvp_rankings_ultra_league) {
                            //     object.ultra_league = object.pvp_rankings_great_league;
                            // } else {
                            object.ultra_league = await WDR.PvP.CalculatePossibleCPs(WDR, object.pokemon_id, object.form_id, object.individual_attack, object.individual_defense, object.individual_stamina, object.pokemon_level, object.gender_name, 'ultra', 'webhook.js ultra');
                            // }

                            WDR.Subscriptions.PvP(WDR, object);

                            WDR.Feeds.PvP(WDR, object);

                        } else {
                            //WDR.Feeds.NoIVPokemon(WDR, object);
                            //WDR.Subscriptions.NoIVPokemon(WDR, object);
                        }

                    } else if (objectType === 'raid') {

                        if(object.hash){
                            if(Seen_Raids[object.hash] > 0){
                                continue;
                            } else {
                                Seen_Raids[object.hash] = object.time_now;
                            }  
                        }

                        object = await WDR.Get_Locale.Pokemon(WDR, object);

                        WDR.Feeds.Raids(WDR, object);

                        WDR.Subscriptions.Raids(WDR, object);

                    } else if (objectType === 'quest') {

                        object = await WDR.Get_Quest_Reward(WDR, object);

                        if (!object) {
                            WDR.Cosole.error(WDR, '[webhooks.js] Quest object lost when trying to get Reward', Payload[p]);
                        }

                        object = await WDR.Get_Quest_Task(WDR, object);

                        if (!object) {
                            WDR.Cosole.error(WDR, '[webhooks.js] Quest object lost when trying to get Task', Payload[p]);
                        }

                        WDR.Feeds.Quests(WDR, object);

                        WDR.Subscriptions.Quests(WDR, object);

                    } else if (objectType === 'pokestop') {

                        WDR.Feeds.Lures(WDR, object);

                        //WDR.Subscriptions.Lures(WDR, object);

                    } else if (objectType === 'invasion') {

                        WDR.Feeds.Invasions(WDR, object);

                        //WDR.Subscriptions.Invasions(WDR, object);
                    }
                }
            }
        }
            
    }

    // END
    return;
};