exports.Load = function (WDR) {
    return new Promise(async resolve => {

        let Modules = {};
        Modules.Feeds = {};
        Modules.Subscriptions = {};

        delete require.cache[require.resolve(WDR.Dir + "/src/feeds/raids.js")];
        Modules.Feeds.Raids = require(WDR.Dir + "/src/feeds/raids.js");

        delete require.cache[require.resolve(WDR.Dir + "/src/feeds/quests.js")];
        Modules.Feeds.Quests = require(WDR.Dir + "/src/feeds/quests.js");

        delete require.cache[require.resolve(WDR.Dir + "/src/feeds/pokemon.js")];
        Modules.Feeds.Pokemon = require(WDR.Dir + "/src/feeds/pokemon.js");

        delete require.cache[require.resolve(WDR.Dir + "/src/feeds/pvp.js")];
        Modules.Feeds.PvP = require(WDR.Dir + "/src/feeds/pvp.js");

        delete require.cache[require.resolve(WDR.Dir + "/src/feeds/lure.js")];
        Modules.Feeds.Lures = require(WDR.Dir + "/src/feeds/lure.js");

        delete require.cache[require.resolve(WDR.Dir + "/src/feeds/invasion.js")];
        Modules.Feeds.Invasions = require(WDR.Dir + "/src/feeds/invasion.js");

        WDR.Console.info(WDR, "[load_modules.js] Loaded all feed filtering Modules.");

        delete require.cache[require.resolve(WDR.Dir + "/src/subscriptions/raids.js")];
        Modules.Subscriptions.Raids = require(WDR.Dir + "/src/subscriptions/raids.js");

        delete require.cache[require.resolve(WDR.Dir + "/src/subscriptions/quests.js")];
        Modules.Subscriptions.Quests = require(WDR.Dir + "/src/subscriptions/quests.js");

        delete require.cache[require.resolve(WDR.Dir + "/src/subscriptions/pokemon.js")];
        Modules.Subscriptions.Pokemon = require(WDR.Dir + "/src/subscriptions/pokemon.js");

        delete require.cache[require.resolve(WDR.Dir + "/src/subscriptions/pvp.js")];
        Modules.Subscriptions.PvP = require(WDR.Dir + "/src/subscriptions/pvp.js");

        delete require.cache[require.resolve(WDR.Dir + "/src/subscriptions/lure.js")];
        Modules.Subscriptions.Lures = require(WDR.Dir + "/src/subscriptions/lure.js");

        delete require.cache[require.resolve(WDR.Dir + "/src/subscriptions/invasion.js")];
        Modules.Subscriptions.Invasions = require(WDR.Dir + "/src/subscriptions/invasion.js");

        WDR.Console.info(WDR, "[load_modules.js] Loaded all subscription filtering Modules.");

        return resolve(Modules);
    });
}