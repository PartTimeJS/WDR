exports.Load = function(WDR) {
  return new Promise(async resolve => {

    let Modules = {};
    Modules.Feeds = {};
    Modules.Subscriptions = {};

    delete require.cache[require.resolve(WDR.dir + "/src/feeds/raids.js")];
    Modules.Feeds.Raids = require(WDR.dir + "/src/feeds/raids.js");

    delete require.cache[require.resolve(WDR.dir + "/src/feeds/quests.js")];
    Modules.Feeds.Quests = require(WDR.dir + "/src/feeds/quests.js");

    delete require.cache[require.resolve(WDR.dir + "/src/feeds/pokemon.js")];
    Modules.Feeds.Pokemon = require(WDR.dir + "/src/feeds/pokemon.js");

    delete require.cache[require.resolve(WDR.dir + "/src/feeds/pvp.js")];
    Modules.Feeds.PvP = require(WDR.dir + "/src/feeds/pvp.js");

    delete require.cache[require.resolve(WDR.dir + "/src/feeds/lure.js")];
    Modules.Feeds.Lures = require(WDR.dir + "/src/feeds/lure.js");

    delete require.cache[require.resolve(WDR.dir + "/src/feeds/invasion.js")];
    Modules.Feeds.Invasions = require(WDR.dir + "/src/feeds/invasion.js");

    console.log("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [load_modules.js] Loaded all feed filtering Modules.");

    delete require.cache[require.resolve(WDR.dir + "/src/subscriptions/raids.js")];
    Modules.Subscriptions.Eaids = require(WDR.dir + "/src/subscriptions/raids.js");

    delete require.cache[require.resolve(WDR.dir + "/src/subscriptions/quests.js")];
    Modules.Subscriptions.Quests = require(WDR.dir + "/src/subscriptions/quests.js");

    delete require.cache[require.resolve(WDR.dir + "/src/subscriptions/pokemon.js")];
    Modules.Subscriptions.Pokemon = require(WDR.dir + "/src/subscriptions/pokemon.js");

    delete require.cache[require.resolve(WDR.dir + "/src/subscriptions/pvp.js")];
    Modules.Subscriptions.PvP = require(WDR.dir + "/src/subscriptions/pvp.js");

    delete require.cache[require.resolve(WDR.dir + "/src/subscriptions/lure.js")];
    Modules.Subscriptions.Lures = require(WDR.dir + "/src/subscriptions/lure.js");

    delete require.cache[require.resolve(WDR.dir + "/src/subscriptions/invasion.js")];
    Modules.Subscriptions.Invasions = require(WDR.dir + "/src/subscriptions/invasion.js");

    console.log("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [load_modules.js] Loaded all subscription filtering Modules.");

    return resolve(Modules);
  });
}