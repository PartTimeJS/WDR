/* eslint-disable no-async-promise-executor */
exports.Load = function (WDR) {
    return new Promise(async resolve => {

        let Geofences = new WDR.DiscordJS.Collection();

        WDR.Fs.readdir(WDR.Dir + '/configs/geofences', (err, geofences) => {

            let geofence_files = geofences.filter(g => g.split('.').pop() === 'json');

            geofence_files.forEach((g,) => {

                delete require.cache[require.resolve(WDR.Dir + '/configs/geofences/' + g)];

                let geofence = require(WDR.Dir + '/configs/geofences/' + g);

                geofence.name = g;

                Geofences.set(g, geofence);
            });
            // LOG SUCCESS AND COUNTS
            WDR.Console.info(WDR, '[load_geofences.js] Loaded ' + geofence_files.length + ' Geofences.');
            // END
            return resolve(Geofences);
        });
    });
};