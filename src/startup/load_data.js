/* eslint-disable no-async-promise-executor */
exports.Load = function (WDR) {
    return new Promise(async resolve => {

        //WDR.Master = require(WDR.Dir + '/static/data/master.json');
        WDR.Master = await WDR.Fetch_JSON('https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest.json');
        WDR.Master.type_effectiveness = require(WDR.Dir + '/static/data/type_effectiveness.json').Types;
        WDR.ICONS = {
            pokemon: await WDR.Fetch_JSON(WDR.Config.ICONS_URL + '/pokemon/index.json')
            //rewards: await WDR.Fetch_JSON(WDR.Config.ICONS_URL + '/rewards/index.json')
        };

        // LOAD LANGUAGE LOCALES
        WDR.Locales = {};
        WDR.Locales.de = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/de.json');
        WDR.Locales.fr = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/fr.json');
        WDR.Locales.it = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/it.json');
        WDR.Locales.jp = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/jp.json');
        WDR.Locales.ko = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/ko.json');
        WDR.Locales.pl = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/pl.json');
        WDR.Locales.pt_br = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/pt_br.json');
        WDR.Locales.ru = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/ru.json');
        WDR.Locales.sp = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/sp.json');
        WDR.Locales.sv = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/sv.json');
        WDR.Locales.zh_cn = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/zh_cn.json');
        WDR.Locales.zh_hk = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/zh_hk.json');
        WDR.Locales.zh_tw = await WDR.Fetch_JSON('https://raw.githubusercontent.com/pmsf/PMSF/master/static/locales/zh_tw.json');
        WDR.Console.info(WDR, '[load_data.js] Loaded Language files.');

        // LOAD CP MULTIPLIER
        delete require.cache[require.resolve(WDR.Dir + '/static/data/cp_multiplier.json')];
        WDR.cp_multiplier = require(WDR.Dir + '/static/data/cp_multiplier.json');

        // END
        return resolve(WDR);
    });
};