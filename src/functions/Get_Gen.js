module.exports = (ID) => {
    return new Promise(resolve => {
        switch (true) {
            case ID <= 151:
                return resolve(1);
            case ID <= 251:
                return resolve(2);
            case ID <= 386:
                return resolve(3);
            case ID <= 493:
                return resolve(4);
            case ID <= 649:
                return resolve(5);
            case ID <= 721:
                return resolve(6);
            case ID <= 809:
                return resolve(7);
            default:
                return resolve(0);
        }
    });
};