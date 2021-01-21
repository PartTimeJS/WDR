'use strict';

const Utils = require('./utilities.js');
const DiscordClient = ('../discords.js');

class Pokemon {
    constructor(object){

        this.pokemon_id = object.pokemon_id;
        this.webhook = Utils.Get_Locale.Pokemon(object);

        this.client = new DiscordClient();

        this.gen = Utils.Get_Gen(this.pokemon_id);

        this.weather_boost = Utils.Get_Weather(this.webhook);
        if (!this.weather_boost || this.weather_boost == undefined) {
            Utils.Console.Error('[handlers/webhooks.js] Undefined Emoji for Weather ID ' + this.weather + '. Emoji does not exist in defined emoji server(s).');
        }

        this.getSize();
        this.getGenderDetails();

        this.internal_value = (Math.floor(((this.individual_defense + this.individual_stamina + this.individual_attack) / 45) * 1000) / 10);

    
        this.sendFeed();
        this.sendAlert();
    }

    getGenderDetails(){
        if (this.gender) {
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
            this.gender_wemoji = Utils.Capitalize(this.gender_name) + ' ' + WDR.Emotes[this.gender_name];
            this.gender_noemoji = Utils.Capitalize(this.gender_name);
        }
        return;
    }

    sendFeed(){

    }
    
    sendAlert(){

    }
}

module.exports = Pokemon;