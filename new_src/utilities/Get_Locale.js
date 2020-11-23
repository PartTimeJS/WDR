/* eslint-disable no-async-promise-executor */
'use strict';

const Utils = require('../utilities.js');

module.exports = {

    // GET POKEMON INFORMATION
    async Pokemon(sighting) {
        return new Promise(async resolve => {

            sighting.form_id = sighting.form;

            if (sighting.pokemon_id === 0) {
                return resolve(sighting);
            }

            if (!sighting.costume_id) {
                sighting.costume_id = sighting.costume;
            }

            // DETERMINE DISCORD LANGUAGE
            switch (sighting.discord.sighting) {
                case undefined:
                case 'en':

                    if (sighting.weather_boost && sighting.weather_boost != '') {
                        sighting.weather_boost += ' ***Boosted***';
                    }


                    sighting.pokemon_name = WDR.Master.Pokemon[sighting.pokemon_id].name;


                    if (sighting.evolution > 0) {
                        try {
                            sighting.pokemon_name = 'Mega ' + sighting.pokemon_name;
                            if (sighting.evolution > 1) {
                                sighting.pokemon_name = sighting.pokemon_name + ' ' + WDR.Master.Mega_Forms[sighting.evolution];
                            }
                        } catch (e) {
                            console.error(e);
                            console.error('Mega Forms: ', WDR.Master.Mega_Forms);
                        }



                    } else if (sighting.form_id) {
                        if (!WDR.Master.Pokemon[sighting.pokemon_id].forms[sighting.form_id]) {
                            WDR.Console.error(WDR, '[Get_sighting.js] No form found for Pokemon: ' + WDR.Master.Pokemon[sighting.pokemon_id].name + ' Form#: ' + sighting.form_id);
                            return resolve(sighting);
                        }
                        sighting.form_name = WDR.Master.Pokemon[sighting.pokemon_id].forms[sighting.form_id].form ? '[' + WDR.Master.Pokemon[sighting.pokemon_id].forms[sighting.form_id].form + ']' : '';
                    } else {
                        sighting.form_name = '';
                    }


                    if (sighting.display_pokemon_id != null) {
                        sighting.pokemon_name += ' (' + WDR.Master.Pokemon[sighting.display_pokemon_id].name + ')';
                    }


                    if (sighting.move_1) {
                        if (!WDR.Master.Moves[sighting.move_1]) {
                            return WDR.Console.error(WDR, '[Get_sighting.js] No Move found for ' + sighting.move_1);
                        }
                        sighting.move_1_name = WDR.Master.Moves[sighting.move_1].name;
                    }


                    if (sighting.move_2) {
                        if (!WDR.Master.Moves[sighting.move_2]) {
                            return WDR.Console.error(WDR, '[Get_sighting.js] No Move found for ' + sighting.move_2);
                        }
                        sighting.move_2_name = WDR.Master.Moves[sighting.move_2].name;
                    }
                    break;


                default:

                    if (sighting.weather_boost != '') {
                        if (!WDR.sightings[sighting.discord.sighting]['Boosted']) {
                            WDR.Console.error(WDR, '[Get_sighting.js] No ' + sighting.discord.sighting + ' Translation found for `Boosted`.');
                        }
                        sighting.weather_boost += WDR.sightings[sighting.discord.sighting]['Boosted'] ? ' ***' + WDR.sightings[sighting.discord.sighting]['Boosted'] + '***' : ' ***Boosted***';
                    }

                    var sighting_pokemon_name = WDR.sightings[sighting.discord.sighting][WDR.Master.Pokemon[sighting.pokemon_id].name];


                    sighting.pokemon_name = sighting_pokemon_name ? sighting_pokemon_name : WDR.Master.Pokemon[sighting.pokemon_id].name;

                    if (sighting.move_1) {
                        let local_move_1_name = WDR.sightings[sighting.discord.sighting][WDR.Master.Moves[sighting.move_1].name];
                        if (!WDR.sightings[sighting.discord.sighting][WDR.Master.Moves[sighting.move_1]]) {
                            WDR.Console.error(WDR, '[Get_sighting.js] ' + sighting.discord.sighting + ' Translation does not exist for Move # ' + sighting.move_1);
                        }
                        sighting.move_1_name = local_move_1_name ? local_move_1_name : WDR.Master.Moves[sighting.move_1].name;
                    }


                    if (sighting.move_2) {
                        let sighting_move_2_name = WDR.sightings[sighting.discord.sighting][WDR.Master.Moves[sighting.move_2].name];
                        if (!WDR.sightings[sighting.discord.sighting][WDR.Master.Moves[sighting.move_2]]) {
                            WDR.Console.error(WDR, '[Get_sighting.js] ' + sighting.discord.sighting + ' Translation does not exist for Move # ' + sighting.move_2);
                        }
                        sighting.move_2_name = sighting_move_2_name ? sighting_move_2_name : WDR.Master.Moves[sighting.move_2].name;
                    }

                    if (sighting.form_id) {
                        let sighting_form = '[' + WDR.sightings[sighting.discord.sighting][WDR.Master.Pokemon[sighting.pokemon_id].forms[sighting.form_id].name] + '] ';
                        if (!WDR.sightings[sighting.discord.sighting][WDR.Master.Pokemon[sighting.pokemon_id].forms[sighting.form_id].name]) {
                            WDR.Console.error(WDR, '[Get_sighting.js] ' + sighting.discord.sighting + ' Translation does not exist for form: ' + WDR.Master.Pokemon[sighting.pokemon_id].forms[sighting.form_id].name);
                        }
                        sighting.form_name = sighting_form ? '[' + sighting_form + ']' : '';
                    } else {
                        sighting.form_name = '';
                    }

                    // IDENTIFY DITTO AND ALTER DISPLAY NAME
                    if (sighting.display_pokemon_id != null) {
                        let display_pokemon_name = WDR.sightings[sighting.discord.sighting][WDR.Master.Pokemon[sighting.display_pokemon_id].name];
                        display_pokemon_name = display_pokemon_name ? display_pokemon_name : WDR.Master.Pokemon[sighting.pokemon_id].name;
                        sighting.pokemon_name += ' (' + display_pokemon_name + ')';
                    }
            }

            // END
            return resolve(sighting);
        });
    },


    async Quest(WDR, Quest) {
        return new Promise(async resolve => {
            WDR.Console.log(WDR, '[sighting]', Quest);
            return resolve(Quest);
        });
    },

    // async Raid(WDR, Lure) {
    //     return new Promise(async resolve => {

    //     });
    // },

    // async Invasion(WDR, Lure) {
    //     return new Promise(async resolve => {

    //     });
    // },

    // async Lure(WDR, Lure) {
    //     return new Promise(async resolve => {

    //     });
    // }
};