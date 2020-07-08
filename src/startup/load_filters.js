exports.Load = function(WDR) {
  return new Promise(async resolve => {
    let filter_count = 0;

    let Filters = new WDR.DiscordJS.Collection();

    await WDR.Fs.readdir(WDR.dir + "/configs/filters", (err, filters) => {

      let filter_files = filters.filter(f => f.split(".").pop() === "json");

      filter_files.forEach((f, i) => {

        delete require.cache[require.resolve(WDR.dir + "/configs/filters/" + f)];

        filter_count++;

        let filter = require(WDR.dir + "/configs/filters/" + f);
        filter.name = f;

        Filters.set(f, filter);

      });
      // LOG SUCCESS AND COUNTS
      console.log("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [load_filters.js] Loaded " + filter_count + " filters.");
      // END
      return resolve(Filters);
    });
  });
}