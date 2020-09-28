exports.Load = function(WDR, type) {
  return new Promise(async resolve => {
    // DEFINE LOADED CHANNEL ARRAY
    let FEEDS = [];
    // DEFINE CHANNEL FILE COUNT
    let file_count = 0;
    // READ FILTER DIRECTORY FOR FILTER TYPE
    await WDR.Fs.readdir(WDR.Dir + "/configs/" + type.toLowerCase(), async (err, functions) => {
      // IDENTIFY EACH INI CHANNEL FILE
      let feed_files = functions.filter(f => f.split(".").pop() === "ini");
      // GET FEEDS
      await feed_files.forEach((file, i) => {
        // INCREMENT COUNT FOR EACH FILE
        file_count++;
        // READ THE DATA FROM EACH FILE
        let Channels = WDR.Ini.parse(WDR.Fs.readFileSync(WDR.Dir + "/configs/" + type.toLowerCase() + "/" + file, "utf-8"));
        // LOOP FOR EACH CHANNEL IN THE FILE
        for (var key in Channels) {
          // LOAD THE CHANNEL WITH PARAMETERS TO THE ARRAY
          FEEDS.push([key, Channels[key]]);
        }
      });
      // LOG SUCCESS AND COUNTS
      WDR.Console.info(WDR, "[load_feeds.js] Loaded " + FEEDS.length + " " + type.replace("_", " ") + " in " + file_count + " files.");
      // END
     return resolve(FEEDS);
    });
  });
}