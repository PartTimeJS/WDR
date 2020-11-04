module.exports = (num) => {
    return new Promise(resolve => {
        switch (num) {
            case 1:
                return resolve('Male');
            case 2:
                return resolve('Female');
            case 4:
                return resolve('All');
            default:
                return resolve(null);
        }
    });
};