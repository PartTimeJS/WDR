/* eslint-disable no-async-promise-executor */
'use strict';

const { Master, Log, Translations } = require('../../../utilities.js');

module.exports = {

    // GET POKEMON INFORMATION
    async Pokemon(object) {
        return new Promise(async resolve => {

            let locale = {};

            locale.form_id = object.form;

            if (object.pokemon_id === 0) {
                return resolve(locale);
            }

            if (!locale.costume_id) {
                locale.costume_id = object.costume;
            }

            // DETERMINE DISCORD LANGUAGE
            switch (object.discord.locale) {
                case undefined:
                case 'en':

                    if (object.weather_boost && object.weather_boost != '') {
                        locale.weather_boost += ' ***Boosted***';
                    }

                    locale.pokemon_name = Master.Pokemon[object.pokemon_id].name;

                    if (object.evolution > 0) {
                        try {
                            locale.pokemon_name = 'Mega ' + locale.pokemon_name;
                            if (object.evolution > 1) {
                                locale.pokemon_name = locale.pokemon_name + ' ' + Master.Mega_Forms[object.evolution];
                            }
                        } catch (e) {
                            console.error(e);
                            console.error('Mega Forms: ', Master.Mega_Forms);
                        }

                    } else if (locale.form_id) {
                        if (!Master.Pokemon[object.pokemon_id].forms[locale.form_id]) {
                            Log.error('[Get_locale.js] No form found for Pokemon: ' + Master.Pokemon[object.pokemon_id].name + ' Form#: ' + locale.form_id);
                            return resolve(locale);
                        }
                        locale.form_name = Master.Pokemon[object.pokemon_id].forms[locale.form_id].form ? '[' + Master.Pokemon[object.pokemon_id].forms[locale.form_id].form + ']' : '';
                    } else {
                        locale.form_name = '';
                    }

                    if (object.display_pokemon_id != null) {
                        locale.pokemon_name += ' (' + Master.Pokemon[object.display_pokemon_id].name + ')';
                    }

                    if (object.move_1) {
                        if (!Master.Moves[object.move_1]) {
                            return Log.error('[Get_locale.js] No Move found for ' + object.move_1);
                        }
                        object.move_1_name = Master.Moves[object.move_1].name;
                    }

                    if (object.move_2) {
                        if (!Master.Moves[object.move_2]) {
                            return Log.error('[Get_locale.js] No Move found for ' + object.move_2);
                        }
                        object.move_2_name = Master.Moves[object.move_2].name;
                    }
                    break;


                default:

                    if (locale.weather_boost != '') {
                        if (!Translations[locale.discord.locale]['Boosted']) {
                            Log.error('[Get_locale.js] No ' + locale.discord.locale + ' Translation found for `Boosted`.');
                        }
                        locale.weather_boost += Translations[locale.discord.locale]['Boosted'] ? ' ***' + Translations[locale.discord.locale]['Boosted'] + '***' : ' ***Boosted***';
                    }

                    var locale_pokemon_name = Translations[locale.discord.locale][Master.Pokemon[object.pokemon_id].name];

                    locale.pokemon_name = locale_pokemon_name ? locale_pokemon_name : Master.Pokemon[object.pokemon_id].name;

                    if (object.move_1) {
                        let local_move_1_name = Translations[locale.discord.locale][Master.Moves[object.move_1].name];
                        if (!Translations[locale.discord.locale][Master.Moves[object.move_1]]) {
                            Log.error('[Get_locale.js] ' + locale.discord.locale + ' Translation does not exist for Move # ' + object.move_1);
                        }
                        object.move_1_name = local_move_1_name ? local_move_1_name : Master.Moves[object.move_1].name;
                    }

                    if (object.move_2) {
                        let locale_move_2_name = Translations[locale.discord.locale][Master.Moves[object.move_2].name];
                        if (!Translations[locale.discord.locale][Master.Moves[object.move_2]]) {
                            Log.error('[Get_locale.js] ' + locale.discord.locale + ' Translation does not exist for Move # ' + object.move_2);
                        }
                        object.move_2_name = locale_move_2_name ? locale_move_2_name : Master.Moves[object.move_2].name;
                    }

                    if (locale.form_id) {
                        let locale_form = '[' + Translations[locale.discord.locale][Master.Pokemon[object.pokemon_id].forms[locale.form_id].name] + '] ';
                        if (!Translations[locale.discord.locale][Master.Pokemon[object.pokemon_id].forms[locale.form_id].name]) {
                            Log.error('[Get_locale.js] ' + locale.discord.locale + ' Translation does not exist for form: ' + Master.Pokemon[object.pokemon_id].forms[locale.form_id].name);
                        }
                        locale.form_name = locale_form ? '[' + locale_form + ']' : '';
                    } else {
                        locale.form_name = '';
                    }

                    // IDENTIFY DITTO AND ALTER DISPLAY NAME
                    if (locale.display_pokemon_id != null) {
                        let display_pokemon_name = Translations[locale.discord.locale][Master.Pokemon[locale.display_pokemon_id].name];
                        display_pokemon_name = display_pokemon_name ? display_pokemon_name : Master.Pokemon[object.pokemon_id].name;
                        locale.pokemon_name += ' (' + display_pokemon_name + ')';
                    }
            }

            // END
            return resolve(locale);
        });
    },


    async Quest(Quest) {
        return new Promise(async resolve => {
            Log.error.log('[LOCALE]', Quest);
            return resolve(Quest);
        });
    },

    // async Raid(Lure) {
    //     return new Promise(async resolve => {

    //     });
    // },

    // async Invasion(Lure) {
    //     return new Promise(async resolve => {

    //     });
    // },

    // async Lure(Lure) {
    //     return new Promise(async resolve => {

    //     });
    // }
};