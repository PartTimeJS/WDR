'use strict';

const Utils = require('../utilities.js');
const Alert = require('./spawn_alert.js');
const Feed = require('./spawn_feed.js');

class Pokemon {
    constructor(object){

        this = object;

        this.client = new DiscordClient();

        this.gen = Utils.Get_Gen(this.pokemon_id);

        this.weather_boost = Utils.Get_Weather(this);

        if (this.weather_boost == undefined) {
            Utils.Console.Error('[handlers/webhooks.js] Undefined Emoji for Weather ID ' + this.weather + '. Emoji does not exist in defined emoji server(s).');
        }

        this.size = Utils.Get_Size(this);

        this = await Utils.Get_Locale.Pokemon(this);

        this.internal_value = (Math.floor(((this.individual_defense + this.individual_stamina + this.individual_attack) / 45) * 1000) / 10);

        if (this.gender == 1) {
            this.gender_name = 'male';
            this.gender_id = 1;
        } else if (this.gender == 2) {
            this.gender_name = 'female';
            this.gender_id = 2;
        } else {
            delete this.gender;
            this.gender_name = 'all';
            this.gender_id = 0;
        }
        if (this.gender) {
            this.gender_wemoji = await Utils.Capitalize(this.gender_name) + ' ' + WDR.Emotes[this.gender_name];
            this.gender_noemoji = await Utils.Capitalize(this.gender_name);
        }

        new Alert(this);

        new Feed(this);
    }
    
}

module.exports = Pokemon;