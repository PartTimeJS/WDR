/* eslint-disable no-async-promise-executor */
exports.Load = function (WDR) {
    return new Promise(async resolve => {
        let filter_count = 0;

        let Filters = new WDR.DiscordJS.Collection();

        await WDR.Fs.readdir(WDR.Dir + '/configs/filters', (err, filters) => {

            let filter_files = filters.filter(f => f.split('.').pop() === 'json');

            filter_files.forEach((f) => {

                delete require.cache[require.resolve(WDR.Dir + '/configs/filters/' + f)];

                filter_count++;

                let filter = require(WDR.Dir + '/configs/filters/' + f);
                filter.name = f;

                Filters.set(f, filter);

            });
            // LOG SUCCESS AND COUNTS
            WDR.Console.info(WDR, '[load_filters.js] Loaded ' + filter_count + ' filters.');
            // END
            return resolve(Filters);
        });
    });
};