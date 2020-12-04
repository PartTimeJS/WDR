'use strict';

const PointInGeoJSON = require('point-in-geopolygon');
const GeoTz = require('geo-tz');

const { Discords, Geofences, PvP } = require('./utilities.js');

const DiscordClient = require('./services/discord.js.js');


const dataTypes = ['pokemon', 'raid', 'quest', 'pokestop', 'invasion'];

class Webhook {
    constructor(object) {
        for(const item in object){
            this[item] = object[item];
        }
        console.log(this);
    }


    validate() {

        this.time_now = new Date().getTime();

        if (WDR.Config.DEBUG.Processing_Speed == 'ENABLED') {
            this.WDR_Received = this.time_now;
        }

        if (!dataTypes.includes(this.type)) {
            return;
        }

        for (let d = 0, dlen = Discords.length; d < dlen; d++) {
            let discord = Discords[d];

            if (PointInGeoJSON.polygon(discord.geofence, [this.longitude, this.latitude])) {

                this.timezone = GeoTz(discord.geofence[0][1][1], discord.geofence[0][1][0])[0];

                this.area = {};
                this.area.default = discord.name;

                if (discord.geojson_file && discord.geojson_file !== '') {
                    let geofences = Geofences.get(discord.geojson_file).features;
                    if (!geofences) {
                        WDR.Console.error(WDR, '[Get_Area.js] Geofence configs/geofences/' + discord.geojson_file + ' does not appear to exist.');
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

                    if (this.area.sub) {
                        this.area.embed = this.area.sub;
                    } else if (this.area.main && !this.area.sub) {
                        this.area.embed = this.area.main;
                    } else if (!this.area.sub && !this.area.main) {
                        this.area.embed = this.area.default;
                    }
                } else {
                    Log.error(`[Get_Area.js] geojson file does not exist for ${discord.name}.`);
                }


                if (this.type == 'pokemon') {
                    if(this.cp > 0){
                        const pokemon = new PokemonObject(this);
                        pokemon.Alert();
                        pokemon.Feed();
                    }


                } else if (this.type == 'raid') {
                    const raid = new RaidObject(this);
                    raid.Alert();
                    raid.Feed();


                } else if (this.type == 'quest') {
                    const quest = new QuestObject(this);
                    quest.Alert();
                    quest.Feed();


                } else if (this.type == 'pokestop') {
                    const pokestop = new PokestopObject(this);
                    //pokestop.Alert();
                    pokestop.Feed();


                } else if (this.type == 'invasion') {
                    const invasion = new InvasionObject(this);
                    //invasion.Alert();
                    invasion.Feed();


                }
            }
        }

        // END 
        return;
    }
}
    {
        {
    
            if (this.type == 'pokemon') {

                if (this.cp > 0) {
                    // if (this.pvp_rankings_great_league) {
                    //     this.great_league = this.pvp_rankings_great_league;
                    // } else {
                    this.great_league = await PvP.CalculatePossibleCPs(WDR, this.pokemon_id, this.form_id, this.individual_attack, this.individual_defense, this.individual_stamina, this.pokemon_level, this.gender_name, 'great', 'webhook.js great');
                    // }

                    // if (this.pvp_rankings_ultra_league) {
                    //     this.ultra_league = this.pvp_rankings_great_league;
                    // } else {
                    this.ultra_league = await PvP.CalculatePossibleCPs(WDR, this.pokemon_id, this.form_id, this.individual_attack, this.individual_defense, this.individual_stamina, this.pokemon_level, this.gender_name, 'ultra', 'webhook.js ultra');
                    // }

                    WDR.Subscriptions.PvP(WDR, object);

                    WDR.Feeds.PvP(WDR, object);

                } else {
                    //WDR.Feeds.NoIVPokemon(WDR, object);
                    //WDR.Subscriptions.NoIVPokemon(WDR, object);
                }

            } else if (this.type == 'raid') {

                if (!Reported_Raids.includes(this.gym_id)) {

                    Reported_Raids.push(this.gym_id);

                    object = await WDR.Get_Locale.Pokemon(WDR, object);

                    WDR.Feeds.Raids(WDR, object);

                    WDR.Subscriptions.Raids(WDR, object);

                }
            } else if (this.type == 'quest') {

                if (!Reported_Quests.includes(this.pokestop_id)) {
                    Reported_Quests.push(this.pokestop_id);

                    object = await WDR.Get_Quest_Reward(WDR, object);

                    if (!object) {
                        return WDR.Cosole.error(WDR, '[webhooks.js] Quest object lost when trying to get Reward', this.object)
                    }

                    object = await WDR.Get_Quest_Task(WDR, object);

                    if (!object) {
                        return WDR.Cosole.error(WDR, '[webhooks.js] Quest object lost when trying to get Task', this.object)
                    }

                    WDR.Feeds.Quests(WDR, object);

                    WDR.Subscriptions.Quests(WDR, object);
                }

            } else if (this.type == 'pokestop') {

                if (!Reported_Lures.includes(this.pokestop_id)) {
                    Reported_Lures.push(this.pokestop_id);

                    WDR.Feeds.Lures(WDR, object);

                    //WDR.Subscriptions.Lures(WDR, object);

                }
            } else if (this.type == 'invasion') {

                if (!Reported_Invasions.includes(this.pokestop_id)) {
                    Reported_Invasions.push(this.pokestop_id);

                    WDR.Feeds.Invasions(WDR, object);

                    //WDR.Subscriptions.Invasions(WDR, object);
                }
            }
        }
    }