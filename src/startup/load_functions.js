/* eslint-disable no-async-promise-executor */
exports.Load = function (WDR) {
    return new Promise(async resolve => {

        await WDR.Fs.readdir(WDR.Dir + '/src/functions', async (err, functions) => {

            let function_files = functions.filter(f => f.split('.').pop() === 'js');

            await function_files.forEach((f) => {

                delete require.cache[require.resolve(WDR.Dir + '/src/functions/' + f)];

                WDR[f.slice(0, -3)] = require(WDR.Dir + '/src/functions/' + f);

            });

            // LOG SUCCESS AND COUNTS
            WDR.Console.info(WDR, '[load_functions.js] Loaded ' + function_files.length + ' functions.');

            // END
            return resolve(WDR);
        });
    });
};