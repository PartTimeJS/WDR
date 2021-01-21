/* eslint-disable no-async-promise-executor */
exports.Load = function (WDR) {
    return new Promise(async resolve => {
        let discord_count = 0;

        let Discords = [];

        await WDR.Fs.readdir(WDR.Dir + '/configs/discords', (err, discords) => {

            let discord_files = discords.filter(f => f.split('.').pop() === 'json');

            discord_files.forEach((f) => {

                discord_count++;

                delete require.cache[require.resolve(WDR.Dir + '/configs/discords/' + f)];

                let discord = require(WDR.Dir + '/configs/discords/' + f);

                Discords.push(discord);

            });
            // LOG SUCCESS AND COUNTS
            WDR.Console.info(WDR, '[load_discords.js] Loaded ' + discord_count + ' Discord files.');
            // END
            return resolve(Discords);
        });
    });
};