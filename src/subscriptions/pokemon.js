module.exports = async (WDR, sighting) => {

    let discord = sighting.discord;

    sighting.form_id = sighting.form_id ? sighting.form_id : 0;

    let size = sighting.size === 0 ? sighting.size : sighting.size.toLowerCase();

    let typing = await WDR.Get_Typing(WDR, {
        pokemon_id: sighting.pokemon_id,
        form: sighting.form,
        type: 'type_array'
    });

    let query = `
        SELECT
            *
        FROM
            wdr_pokemon_subs
        WHERE
            status = 1
        AND (
            pokemon_id = 0
                OR
            pokemon_id = ${sighting.pokemon_id}
        )
        AND (
            pokemon_type = '0'
                OR
            pokemon_type = '${typing[0]}'
                OR
            pokemon_type = '${typing[1]}'
        )
        AND (
            form = 0
            OR form = ${sighting.form_id}
        )
        AND
            min_iv <= ${sighting.internal_value}
        AND
            max_iv >= ${sighting.internal_value}
        AND
            min_lvl <= ${sighting.pokemon_level}
        AND
            max_lvl >= ${sighting.pokemon_level}
        AND (
            size = '0'
                OR
            size = '${size}'
        )
        AND (
            gender = 0
                OR
            gender = ${sighting.gender_id}
                OR
            gender = 3
        )
        AND (
            generation = 0
                OR
            generation = ${sighting.gen}
        );
    `;

    // if (sighting.pokemon_id === 1) {
    //   console.log(query)
    // }

    WDR.wdrDB.query(
        query,
        async function (error, matching) {

            // if (sighting.internal_value == 100) {
            //   console.log(matching);
            // }

            if (error) {
                WDR.Console.error(WDR, '[commands/pokemon.js] Error Querying Subscriptions.', [query, error]);
            } else if (matching && matching.length > 0) {

                sighting.sprite = WDR.Get_Sprite(WDR, sighting);

                if (WDR.Config.POKEMON_PREGEN_TILES != 'DISABLED') {
                    sighting.body = await WDR.Generate_Tile(WDR, sighting, 'pokemon', sighting.latitude, sighting.longitude, sighting.sprite);
                    sighting.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + sighting.body;
                }

                for (let m = 0, mlen = matching.length; m < mlen; m++) {

                    let User = matching[m];

                    User.location = JSON.parse(User.location);

                    let authorized = await WDR.Authorize(WDR, discord.id, User.user_id, discord.allowed_roles);
                    if (authorized) {
                        let match = {};

                        if (User.geotype == 'city') {
                            if (User.guild_name == sighting.area.default) {
                                match.embed = matching[0].embed ? matching[0].embed : 'pokemon_iv.js';
                                if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                    WDR.Console.log(WDR, `[DEBUG] [src/subs/pokemon.js] ${User.user_name} - Sent City Geofenced Pokemon DM. ${sighting.area.default} ${sighting.internal_value}IV Lvl${sighting.pokemon_level} ${sighting.pokemon_name}`);
                                }
                                Send_Subscription(WDR, match, sighting, User);
                            } else if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                WDR.Console.info(WDR, `[DEBUG] [src/subs/pokemon.js] ${User.user_name} - Failed City Geofence. Saw: ${User.guild_name}. Wanted: ${sighting.area.default}`);
                            }

                        } else if (User.geotype == 'areas') {
                            let defGeo = (User.areas.split(';').indexOf(sighting.area.default) >= 0);
                            let mainGeo = (User.areas.split(';').indexOf(sighting.area.main) >= 0);
                            let subGeo = (User.areas.split(';').indexOf(sighting.area.sub) >= 0);
                            if (defGeo || mainGeo || subGeo) {
                                match.embed = matching[0].embed ? matching[0].embed : 'pokemon_iv.js';
                                if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                    WDR.Console.log(WDR, `[DEBUG] [src/subs/pokemon.js] ${User.user_name} - Sent Area Geofenced Sighting DM. ${sighting.area.default} ${sighting.internal_value}IV Lvl${sighting.pokemon_level} ${sighting.pokemon_name}`);
                                }
                                Send_Subscription(WDR, match, sighting, User);
                            } else if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                WDR.Console.info(WDR, `[DEBUG] [src/subs/pokemon.js] ${User.user_name} - Failed Area Geofence. Saw: ${User.areas}. Wanted: ${JSON.stringify(sighting.area)}`);
                            } 

                        } else if (User.geotype == 'location') {
                            let distance = WDR.Distance.between({
                                lat: sighting.latitude,
                                lon: sighting.longitude
                            }, {
                                lat: User.location.coords.split(',')[0],
                                lon: User.location.coords.split(',')[1]
                            });
                            let loc_dist = WDR.Distance(parseInt(User.location.radius) + ' km');
                            if (loc_dist > distance) {
                                match.embed = matching[0].embed ? matching[0].embed : 'pokemon_iv.js';
                                if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                    WDR.Console.log(WDR, `[DEBUG] [src/subs/pokemon.js] ${User.user_name} - Sent Location Geofenced DM. ${sighting.area.default} ${sighting.internal_value}IV Lvl${sighting.pokemon_level} ${sighting.pokemon_name}`);
                                }
                                Send_Subscription(WDR, match, sighting, User);
                            } else if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                WDR.Console.info(WDR, `[DEBUG] [src/subs/pokemon.js] ${User.user_name} - Failed Location Geofence. Saw: ${distance}. Wanted: <= ${loc_dist}`);
                            }
                        } else {
                            WDR.Console.error(WDR, '[DEBUG] [src/subs/pokemon.js] User geotype has a bad value.', User);
                        }
                    }
                }
            }
        }
    );

    // END
    return;
};

async function Send_Subscription(WDR, match, sighting, User) {

    await WDR.Rate_Limit(WDR, User);

    let Embed_Config = require(WDR.Dir + '/configs/embeds/' + match.embed);

    match.typing = await WDR.Get_Typing(WDR, {
        pokemon_id: sighting.pokemon_id,
        form: sighting.form
    });

    match.sprite = sighting.sprite;

    match.body = sighting.body;
    match.static_map = sighting.static_map;

    match.type = match.typing.type;
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

    match.google = '[Google Maps](https://www.google.com/maps?q=' + sighting.latitude + ',' + sighting.longitude + ')';
    match.apple = '[Apple Maps](http://maps.apple.com/maps?daddr=' + sighting.latitude + ',' + sighting.longitude + '&z=10&t=s&dirflg=d)';
    match.waze = '[Waze](https://www.waze.com/ul?ll=' + sighting.latitude + ',' + sighting.longitude + '&navigate=yes)';
    match.pmsf = '[Scan Map](' + WDR.Config.FRONTEND_URL + '?lat=' + sighting.latitude + '&lon=' + sighting.longitude + '&zoom=15)';
    match.rdm = '[Scan Map](' + WDR.Config.FRONTEND_URL + '@/' + sighting.latitude + '/' + sighting.longitude + '/15)';

    match.verified = sighting.disappear_time_verified ? WDR.Emotes.checkYes : WDR.Emotes.yellowQuestion;
    match.time = WDR.Time(sighting.disappear_time, '1', sighting.timezone);
    match.mins = Math.floor((sighting.disappear_time - (sighting.time_now / 1000)) / 60);
    match.secs = Math.floor((sighting.disappear_time - (sighting.time_now / 1000)) - (match.mins * 60));

    if (match.mins >= 5) {

        if (WDR.Debug.Processing_Speed == 'ENABLED') {
            let difference = Math.round((new Date().getTime() - sighting.WDR_Received) / 10) / 100;
            match.footer = 'Latency: ' + difference + 's';
        }

        match.embed = Embed_Config(WDR, match);

        WDR.Send_DM(WDR, User.guild_id, User.user_id, match.embed, User.bot);

    }
}