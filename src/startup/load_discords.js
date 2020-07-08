exports.Load = function(WDR) {
  return new Promise(async resolve => {
    let discord_count = 0;

    let Discords = [];

    await WDR.Fs.readdir(WDR.dir + "/configs/discords", (err, discords) => {

      let discord_files = discords.filter(f => f.split(".").pop() === "json");

      discord_files.forEach((f, i) => {

        discord_count++;

        delete require.cache[require.resolve(WDR.dir + "/configs/discords/" + f)];

        let discord = require(WDR.dir + "/configs/discords/" + f);

        Discords.push(discord);

      });
      // LOG SUCCESS AND COUNTS
      console.log("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [load_discords.js] Loaded " + discord_count + " Discord files.");
      // END
      return resolve(Discords);
    });
  });
}