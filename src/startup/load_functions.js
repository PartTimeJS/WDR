exports.Load = function(WDR) {
  return new Promise(async resolve => {

    let Functions = {};

    await WDR.Fs.readdir(WDR.dir + "/src/functions", async (err, functions) => {

      let function_files = functions.filter(f => f.split(".").pop() === "js"),
        funct_count = 0;

      await function_files.forEach((f, i) => {

        delete require.cache[require.resolve(WDR.dir + "/src/functions/" + f)];

        funct_count++;

        WDR[f.slice(0, -3)] = require(WDR.dir + "/src/functions/" + f);

      });

      // LOG SUCCESS AND COUNTS
      console.log("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [load_functions.js] Loaded " + function_files.length + " functions.");

      // END
      return resolve(WDR);
    });
  });
}