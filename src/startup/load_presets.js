exports.Load = function(WDR, type) {
  return new Promise(resolve => {
    let Preset_Array = [],
      preset_count = 0;
    WDR.Fs.readdir(WDR.Dir + "/configs/sub_presets/" + type.toLowerCase(), async (err, presets) => {
      let Presets = new WDR.DiscordJS.Collection();
      if (presets) {
        let preset_files = presets.filter(f => f.split(".").pop() === "ini");
        preset_files.forEach((p, i) => {
          delete require.cache[require.resolve(WDR.Dir + "/configs/sub_presets/" + type + "/" + p)];
          preset_count++;
          let preset = WDR.Ini.parse(WDR.Fs.readFileSync(WDR.Dir + "/configs/sub_presets/" + type + "/" + p, "utf-8"));
          switch (type.toLowerCase()) {

            case "pokemon":
              preset.name = p.replace(/_/g, " ").split(".")[0];
              preset.id = preset.pokemon_id ? parseInt(preset.pokemon_id) : 0;
              preset.form = preset.form ? parseInt(preset.form) : 0;
              preset.size = preset.size ? preset.size : 0;
              preset.gender = preset.gender ? parseInt(preset.gender) : 0;
              preset.gen = preset.gen ? parseInt(preset.gen) : 0;
              preset.min_lvl = preset.min_lvl ? parseInt(preset.min_lvl) : 1;
              preset.max_lvl = preset.max_lvl ? parseInt(preset.max_lvl) : 35;
              preset.min_iv = preset.min_iv ? parseInt(preset.min_iv) : 100;
              preset.max_iv = preset.max_iv ? parseInt(preset.max_iv) : 100;
              preset.min_cp = preset.min_cp ? parseInt(preset.min_cp) : 0;
              preset.max_cp = preset.max_cp ? parseInt(preset.max_cp) : 10000;
              break;

            case "pvp":
              preset.name = p.replace(/_/g, " ").split(".")[0];
              preset.id = preset.pokemon_id ? parseInt(preset.pokemon_id) : 0;
              preset.form = preset.form ? parseInt(preset.form) : 0;
              preset.type = preset.type ? preset.type : 0;
              preset.league = preset.league ? preset.league.toLowerCase() : 0;
              preset.min_rank = preset.min_rank ? parseInt(preset.min_rank) : 10;
              preset.min_lvl = preset.min_lvl ? parseInt(preset.min_lvl) : 1;
              //preset.min_cp = preset.min_cp ? parseInt(preset.min_cp) : 0;
              preset.gen = preset.gen ? parseInt(preset.gen) : 0;
              break;

            case "raid":
              preset.name = p.replace(/_/g, " ").split(".")[0];
              preset.id = preset.pokemon_id ? parseInt(preset.pokemon_id) : 0;
              preset.form = preset.form ? parseInt(preset.form) : 0;
              preset.gym_id = preset.gym_id ? preset.gym_id : 0;
              preset.min_lvl = preset.min_lvl ? parseInt(preset.min_lvl) : 1;
              preset.max_lvl = preset.max_lvl ? parseInt(preset.max_lvl) : 5;
              preset.gen = preset.gen ? parseInt(preset.gen) : 0;
              break;

            case "quest":
              preset.name = p.replace(/_/g, " ").split(".")[0];
              preset.id = preset.pokemon_id ? parseInt(preset.pokemon_id) : 0;
              preset.form = preset.form ? parseInt(preset.form) : 0;
              preset.reward = preset.reward ? parseInt(preset.form) : 0;
              preset.gen = preset.gen ? parseInt(preset.gen) : 0;
              break;

            case "invasion":

              break;
          }
          Presets.set(preset.name, preset);
        });
      }
      type = await WDR.Capitalize(type);
      WDR.Console.info(WDR, "[load_presets.js] Loaded " + preset_count + " " + type + " Subscription Presets.");
     return resolve(Presets);
    });
  });
}