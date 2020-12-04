'use strict';

module.exports = async (weather) => {
    switch (weather) {
        case 1:
            return 'clear';
        case 2:
            return 'rain';
        case 3:
            return 'partlyCloudy';
        case 4:
            return 'cloudy';
        case 5:
            return 'windy';
        case 6:
            return 'snow';
        case 7:
            return 'fog';
        default:
            return '';
    }
};