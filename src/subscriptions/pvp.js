var Leagues = ['great', 'ultra'];
var CPs = [1000, 2000];

module.exports = async (WDR, sighting) => {

    let discord = sighting.discord;

    sighting.form_id = sighting.form_id ? sighting.form_id : 0;

    //let size = sighting.size === 0 ? sighting.size : sighting.size.toLowerCase();

    for (let lg = 0, lglen = Leagues.length; lg < lglen; lg++) {
        let league = Leagues[lg];

        if (sighting[league + '_league'].length > 0) {
            for (let l = 0, llen = sighting[league + '_league'].length; l < llen; l++) {

                let match = {};

                let potential = sighting[league + '_league'][l];
                let rankMatch = potential.rank <= 20;
                let cpMatch = potential.cp >= CPs[lg];
                if (rankMatch && cpMatch) {

                    if (!potential.pokemon_id) {
                        potential.pokemon_id = potential.pokemon;
                    }

                    if (!potential.form_id && potential.form_id !== 0 && potential.form && (potential.form === 0 || potential.form > 0)) {
                        potential.form_id = potential.form;
                    }

                    potential.percent = potential.percentage;
                    potential.gen = await WDR.Get_Gen(potential.pokemon_id);
                    potential.typing = await WDR.Get_Typing(WDR, {
                        pokemon_id: potential.pokemon_id,
                        form_id: (potential.form_id ? potential.form_id : potential.form),
                        type: 'type_array'
                    });

                    match.possible_cps = [potential];

                    let query = `
                        SELECT
                            *
                        FROM
                            wdr_pvp_subs
                        WHERE
                            status = 1
                        AND (
                            pokemon_id  = 0
                                OR
                            pokemon_id = ${sighting.pokemon_id}
                                OR
                            pokemon_id = ${potential.pokemon_id}
                        )
                        AND (
                            pokemon_type  = '0'
                                OR
                            pokemon_type = '${potential.typing[0]}'
                                OR
                            pokemon_type = '${potential.typing[1]}'
                        )
                        AND (
                            form = 0
                                OR
                            form = ${sighting.form_id}
                                OR
                            form = ${(potential.form_id ? potential.form_id : '0')}
                        )
                        AND (
                            league = '0'
                                OR
                            league = '${league}'
                        )
                        AND
                            min_rank >= ${potential.rank}
                        AND
                            min_lvl <= ${sighting.pokemon_level}
                        AND (
                            generation = 0
                                OR
                            generation = ${sighting.gen}
                                OR
                            generation = ${potential.gen}
                        )
                    ;`;
                    WDR.wdrDB.query(
                        query,
                        async function (error, matching) {
                            if (error) {
                                WDR.Console.error(WDR, '[commands/pokemon.js] Error Querying Subscriptions.', [query, error]);
                            } else if (matching && matching.length > 0) {

                                sighting.sprite = WDR.Get_Sprite(WDR, sighting);

                                if (WDR.Config.PVP_PREGEN_TILES != 'DISABLED') {
                                    sighting.body = await WDR.Generate_Tile(WDR, sighting, 'pokemon', sighting.latitude, sighting.longitude, sighting.sprite);
                                    sighting.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + sighting.body;
                                }

                                for (let m = 0, mlen = matching.length; m < mlen; m++) {

                                    let user = matching[m];
                                    try {
                                        user.location = JSON.parse(user.location);
                                    } catch (e) {
                                        console.error(e, user);
                                        console.error('Bad value for user.location', user.location);
                                    }


                                    let authorized = await WDR.Authorize(WDR, discord.id, user.user_id, discord.allowed_roles);
                                    if (authorized) {

                                        if (user.geotype == 'city') {
                                            if (user.guild_name == sighting.area.default) {
                                                match.embed = matching[0].embed ? matching[0].embed : 'pvp.js';
                                                Send_Subscription(WDR, match, sighting, user);
                                            }

                                        } else if (user.geotype == 'areas') {
                                            let defGeo = (user.areas.indexOf(sighting.area.default) >= 0);
                                            let mainGeo = (user.areas.indexOf(sighting.area.main) >= 0);
                                            let subGeo = (user.areas.indexOf(sighting.area.sub) >= 0);
                                            if (defGeo || mainGeo || subGeo) {
                                                match.embed = matching[0].embed ? matching[0].embed : 'pvp.js';
                                                Send_Subscription(WDR, match, sighting, user);
                                            }

                                        } else if (user.geotype == 'location') {
                                            let distance = WDR.Distance.between({
                                                lat: sighting.latitude,
                                                lon: sighting.longitude
                                            }, {
                                                lat: user.location.coords.split(',')[0],
                                                lon: user.location.coords.split(',')[1]
                                            });
                                            let loc_dist = WDR.Distance(user.location.radius + ' km');
                                            if (loc_dist > distance) {
                                                match.embed = matching[0].embed ? matching[0].embed : 'pvp.js';
                                                Send_Subscription(WDR, match, sighting, user);
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    );
                }
            }
        }
    }
    // END
    return;
};

async function Send_Subscription(WDR, match, sighting, user) {

    await WDR.Rate_Limit(WDR, user);

    let Embed_Config = require(WDR.Dir + '/configs/embeds/' + match.embed);

    match.typing = await WDR.Get_Typing(WDR, {
        pokemon_id: sighting.pokemon_id,
        form: sighting.form
    });

    match.pokemon_id = match.possible_cps[0].pokemon_id;
    match.form = match.possible_cps[0].form_id;
    match.sprite = WDR.Get_Sprite(WDR, match);

    match.tile_sprite = sighting.sprite;

    match.body = sighting.body;
    match.static_map = sighting.static_map;

    match.type_wemoji = match.typing.type;
    match.type_noemoji = match.typing.type_noemoji;

    match.color = match.typing.color;

    match.gender_wemoji = sighting.gender_wemoji;
    match.gender_noemoji = sighting.gender_noemoji;

    match.name = sighting.pokemon_name;
    match.id = sighting.pokemon_id;
    match.form = sighting.form_name ? sighting.form_name : '';
    match.form = sighting.form_name == '[Normal]' ? '' : sighting.form_name;

    match.iv = sighting.internal_value;
    match.cp = sighting.cp;

    match.lat = sighting.latitude;
    match.lon = sighting.longitude;

    match.weather_boost = sighting.weather_boost;

    match.area = sighting.area.embed;

    match.map_url = WDR.Config.FRONTEND_URL;

    match.atk = sighting.individual_attack;
    match.def = sighting.individual_defense;
    match.sta = sighting.individual_stamina;

    match.lvl = sighting.pokemon_level;
    match.gen = sighting.gen;

    match.move_1_type = WDR.Emotes[WDR.Master.Moves[sighting.move_1].type.toLowerCase()];
    match.move_2_type = WDR.Emotes[WDR.Master.Moves[sighting.move_2].type.toLowerCase()];
    match.move_1_name = sighting.move_1_name;
    match.move_2_name = sighting.move_2_name;

    match.height = Math.floor(sighting.height * 100) / 100;
    match.weight = Math.floor(sighting.weight * 100) / 100;
    match.size = await WDR.Capitalize(sighting.size);

    match.google = '[Google Maps](https://www.google.com/maps?q=' + match.lat + ',' + match.lon + ')';
    match.apple = '[Apple Maps](http://maps.apple.com/maps?daddr=' + match.lat + ',' + match.lon + '&z=10&t=s&dirflg=d)';
    match.waze = '[Waze](https://www.waze.com/ul?ll=' + match.lat + ',' + match.lon + '&navigate=yes)';
    match.pmsf = '[Scan Map](' + WDR.Config.FRONTEND_URL + '?lat=' + match.lat + '&lon=' + match.lon + '&zoom=15)';
    match.rdm = '[Scan Map](' + WDR.Config.FRONTEND_URL + '@/' + match.lat + '/' + match.lon + '/15)';

    match.verified = sighting.disappear_time_verified ? WDR.Emotes.checkYes : WDR.Emotes.yellowQuestion;
    match.time = WDR.Time(sighting.disappear_time, '1', sighting.timezone);
    match.mins = Math.floor((sighting.disappear_time - (sighting.time_now / 1000)) / 60);
    match.secs = Math.floor((sighting.disappear_time - (sighting.time_now / 1000)) - (match.mins * 60));

    if (match.mins >= 5) {

        match.pvp_data = '';

        match.ranks = '';
        match.possible_cps.forEach(rank_cp => {
            match.ranks += 'Rank ' + rank_cp.rank + ' (' + WDR.Master.Pokemon[rank_cp.pokemon_id].name + ')\n';
        });

        if (WDR.Config.COMPLEX_TILES != 'DISABLED') {
            match.body = await WDR.Generate_Tile(WDR, sighting, 'pokemon', match.lat, match.lon, match.tile_sprite);
            match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;
        }

        if (WDR.Debug.Processing_Speed == 'ENABLED') {
            let difference = Math.round((new Date().getTime() - sighting.WDR_Received) / 10) / 100;
            match.footer = 'Latency: ' + difference + 's';
        }

        match.embed = Embed_Config(WDR, match);

        WDR.Send_DM(WDR, user.guild_id, user.user_id, match.embed, user.bot);

    }

    // END
    return;
}