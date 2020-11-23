'use strict';

module.exports = async (client, object) => {
    switch (object.weather) {
        case 1:
            return resolve(client.Emotes.clear);
        case 2:
            return resolve(client.Emotes.rain);
        case 3:
            return resolve(client.Emotes.partlyCloudy);
        case 4:
            return resolve(client.Emotes.cloudy);
        case 5:
            return resolve(client.Emotes.windy);
        case 6:
            return resolve(client.Emotes.snow);
        case 7:
            return resolve(client.Emotes.fog);
        default:
            return resolve('');
    }
};