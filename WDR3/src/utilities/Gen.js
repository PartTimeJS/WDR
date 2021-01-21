'use strict';

module.exports = (ID) => {
    switch (true) {
        case ID <= 151:
            return 1;
        case ID <= 251:
            return 2;
        case ID <= 386:
            return 3;
        case ID <= 493:
            return 4;
        case ID <= 649:
            return 5;
        case ID <= 721:
            return 6;
        case ID <= 809:
            return 7;
        default:
            return 0;
    }
};