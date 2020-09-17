module.exports = async (string) => {
    return new Promise(async resolve => {
        try {
            if (!string) {
                return resolve('');
            } else if (isNaN(string)) {
                string = string.toLowerCase();
                if (string.split(' ').length > 1) {
                    let processed = '';
                    string.split(' ').forEach((word) => {
                        if(isNaN(word)){
                            processed += ' ' + word.charAt(0).toUpperCase() + word.slice(1);
                        } else {
                            processed += ' ' + word;
                        }
                    });
                    return resolve(processed.slice(1));
                } else {
                    return resolve(string.charAt(0).toUpperCase() + string.slice(1));
                }
            } else {
                return resolve('');
            }
        } catch (e) {
            WDR.Console.error(WDR,'[functions/Capitalize.js] Error Capitalizing string `' + string + '`', e);
        }
    });
}