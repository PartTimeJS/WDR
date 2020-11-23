'use strict';

const PointInGeoJSON = require('point-in-geopolygon');
const DiscordClient = require('./services/discord.js');
const Utils = require('./utilities.js');

class Webhook {
    constructor(object) {
        this = object;
    }

    validateType(){
        const data_types = ['pokemon', 'raid', 'quest', 'pokestop', 'invasion'];
        if (data_types.includes(this.type)) {
            return true;
        } else {
            return false;
        }
    }

    validate() {
        const client = new DiscordClient();
        let validType = this.validateType();
        if(!validType ){
            return;
        }
        for (let d = 0, dlen = client.configs.length; d < dlen; d++) {
            if (PointInGeoJSON.polygon(client.configs[d].geofence, [this.longitude, this.latitude])) {
                this.time_now = new Date().getTime();


                this.timezone = WDR.GeoTz(client.configs[d].geofence[0][1][1], client.configs[d].geofence[0][1][0])[0];

                this.area = {};
                this.area.default = client.configs[d].name;

                if (client.configs[d].geojson_file && client.configs[d].geojson_file != '') {
                    let geofences = await WDR.Geofences.get(object.discord.geojson_file).features;
                    if (!geofences) {
                        WDR.Console.error(WDR, '[Get_Area.js] Geofence configs/geofences/' + object.discord.geojson_file + ' does not appear to exist.');
                    } else {
                        for (let g = 0, glen = geofences.length; g < glen; g++) {
                            let geojson = geofences[g];

                            if (PointInGeoJSON.feature({
                                features: [geojson]
                            }, [this.longitude, this.latitude]) != -1) {
                                if (geojson.properties.sub_area == 'true') {
                                    this.area.sub = geojson.properties.name;
                                } else {
                                    this.area.main = geojson.properties.name;
                                }
                            }
                        }
                    }
                }

                if (this.area.sub) {
                    this.area.embed = this.area.sub;
                } else if (this.area.main && !this.area.sub) {
                    this.area.embed = this.area.main;
                } else if (!this.area.sub && !this.area.main) {
                    this.area.embed = this.area.default;
                }

                if (WDR.Config.DEBUG.Processing_Speed == 'ENABLED') {
                    this.WDR_Received = new Date().getTime();
                }

                if (data.type == 'pokemon') {
                    const pokemon = new PokemonObject(this);

                } else if (data.type == 'raid') {
                    const raid = new RaidObject(this);

                } else if (data.type == 'quest') {
                    const quest = new QuestObject(this);

                } else if (data.type == 'pokestop') {
                    const pokestop = new PokestopObject(this);

                } else if (data.type == 'invasion') {
                    const invasion = new InvasionObject(this);

                }
            }
        }

        // END 
        return;
    }
}
    {
        {
    
            if (data.type == 'pokemon') {

                if (object.cp > 0) {

                    

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

            } else if (data.type == 'raid') {

                if (!Reported_Raids.includes(object.gym_id)) {

                    Reported_Raids.push(object.gym_id);

                    object = await WDR.Get_Locale.Pokemon(WDR, object);

                    WDR.Feeds.Raids(WDR, object);

                    WDR.Subscriptions.Raids(WDR, object);

                }
            } else if (data.type == 'quest') {

                if (!Reported_Quests.includes(object.pokestop_id)) {
                    Reported_Quests.push(object.pokestop_id);

                    object = await WDR.Get_Quest_Reward(WDR, object);

                    if (!object) {
                        return WDR.Cosole.error(WDR, '[webhooks.js] Quest object lost when trying to get Reward', data.message)
                    }

                    object = await WDR.Get_Quest_Task(WDR, object);

                    if (!object) {
                        return WDR.Cosole.error(WDR, '[webhooks.js] Quest object lost when trying to get Task', data.message)
                    }

                    WDR.Feeds.Quests(WDR, object);

                    WDR.Subscriptions.Quests(WDR, object);
                }

            } else if (data.type == 'pokestop') {

                if (!Reported_Lures.includes(object.pokestop_id)) {
                    Reported_Lures.push(object.pokestop_id);

                    WDR.Feeds.Lures(WDR, object);

                    //WDR.Subscriptions.Lures(WDR, object);

                }
            } else if (data.type == 'invasion') {

                if (!Reported_Invasions.includes(object.pokestop_id)) {
                    Reported_Invasions.push(object.pokestop_id);

                    WDR.Feeds.Invasions(WDR, object);

                    //WDR.Subscriptions.Invasions(WDR, object);
                }
            }
        }
    }