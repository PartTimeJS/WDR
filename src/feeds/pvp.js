var Sent_Subscriptions = [];
setInterval(() => {
    Sent_Subscriptions = [];
}, 60000 * 60);

module.exports = async (WDR, sighting) => {

    if (WDR.PvP_Channels.length < 1) {
        return;
    }

    if(sighting.hash){
        if(Sent_Subscriptions.includes(sighting.hash)){
            return;
        } else {
            Sent_Subscriptions.push(sighting.hash);
        }  
    }

    for (let c = 0, clen = WDR.PvP_Channels.length; c < clen; c++) {
        let feed_channel = WDR.PvP_Channels[c];

        let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
        if (!channel) {
            return WDR.Console.error(WDR, '[feeds/pvp.js] The channel ' + feed_channel[0] + ' does not appear to exist.');
        }

        channel.geofences = feed_channel[1].geofences.split(',');
        if (!channel.geofences) {
            return WDR.Console.error(WDR, '[feeds/pvp.js] You do not have a Geofences set for ' + feed_channel[1] + '.');
        }

        channel.filter = WDR.Filters.get(feed_channel[1].filter);
        if (!channel.filter) {
            return WDR.Console.error(WDR, '[feeds/pvp.js] The filter defined for ' + feed_channel[0] + ' does not appear to exist.');
        }

        if (channel.filter.Type != 'pvp') {
            return WDR.Console.error(WDR, '[feeds/pvp.js] The filter defined for ' + feed_channel[0] + ' does not appear to be a pvp filter.');
        }

        if (feed_channel[1].roleid) {
            if (feed_channel[1].roleid == 'here' || feed_channel[1].roleid == 'everyone') {
                sighting.role_id = '@' + feed_channel[1].roleid;
            } else {
                sighting.role_id = '<@&' + feed_channel[1].roleid + '>';
            }
        }


        let defGeo = (channel.geofences.indexOf(sighting.area.default) >= 0);
        let mainGeo = (channel.geofences.indexOf(sighting.area.main) >= 0);
        let subGeo = (channel.geofences.indexOf(sighting.area.sub) >= 0);
        if (defGeo || mainGeo || subGeo) {

            if (!channel.filter.min_cp_range && channel.filter.min_level !== 0) {
                return WDR.Console.error(WDR, '[feeds/pvp.js] Missing `min_cp_range` variable in ' + feed_channel[1].filter + '.');
            } else if (!channel.filter.max_cp_range) {
                return WDR.Console.error(WDR, '[feeds/pvp.js] Missing `max_cp_range` variable in ' + feed_channel[1].filter + '.');
            }

            //let cpRange = ((sighting.cp <= channel.filter.max_cp_range) && (sighting.cp >= channel.filter.min_cp_range));
            //let cpRange = (sighting.cp <= channel.filter.max_cp_range);

            if (!channel.filter.min_level && channel.filter.min_level !== 0) {
                return WDR.Console.error(WDR, '[feeds/pvp.js] Missing `min_level` variable in ' + feed_channel[1].filter + '.');
            }
            //let lvlRange = (sighting.pokemon_level >= channel.filter.min_level);

            if (!channel.filter[WDR.Master.Pokemon[sighting.pokemon_id].name]) {
                return WDR.Console.error(WDR, '[feeds/pvp.js] Missing `' + WDR.Master.Pokemon[sighting.pokemon_id].name + '` in ' + feed_channel[1].filter + '.');
            }
            let filterStatus = (channel.filter[WDR.Master.Pokemon[sighting.pokemon_id].name] == 'True');

            if (filterStatus) {
                //if (lvlRange && filterStatus) {
                //if (cpRange && filterStatus) {

                let match = {
                    pvp_data: '',
                    possible_cps: [],
                    league: channel.filter.league.toLowerCase() + '_league'
                };

                for (let l = 0, llen = sighting[match.league].length; l < llen; l++) {

                    let potential = sighting[match.league][l];

                    potential.typing = await WDR.Get_Typing(WDR, {
                        pokemon_id: potential.pokemon_id,
                        form: potential.form,
                        type: 'type_array'
                    });

                    let rankMatch = potential.rank <= channel.filter.min_pvp_rank;
                    let cpMatch = potential.cp >= channel.filter.min_cp_range;
                    let typeMatch = (channel.filter.type == 'all' || channel.filter.type == undefined) ? true : potential.typing.some(type => channel.filter.type.includes(type));
                    if (rankMatch && cpMatch && typeMatch) {

                        let filtered = {};
                        filtered.types = potential.typing;
                        filtered.pokemon_id = potential.pokemon_id;
                        filtered.rank = potential.rank;
                        filtered.percent = potential.percentage;
                        filtered.level = potential.level;
                        filtered.cp = potential.cp;
                        filtered.value = potential.pvp_value;
                        filtered.form_id = potential.form_id;
                        match.possible_cps.push(filtered);
                    }
                }

                if (match.possible_cps.length > 0) {

                    let Embed_Config = require(WDR.Dir + '/configs/embeds/' + (feed_channel[1].embed ? feed_channel[1].embed : 'pvp.js'));

                    match.typing = await WDR.Get_Typing(WDR, {
                        pokemon_id: sighting.pokemon_id,
                        form: sighting.form
                    });

                    match.pokemon_id = match.possible_cps[0].pokemon_id;
                    match.form = match.possible_cps[0].form_id;
                    match.sprite = WDR.Get_Sprite(WDR, match);

                    match.tile_sprite = WDR.Get_Sprite(WDR, sighting);

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

                    match.pvp_data = '';

                    match.ranks = '';
                    match.possible_cps.forEach(rank_cp => {
                        match.ranks += 'Rank ' + rank_cp.rank + ' (' + WDR.Master.Pokemon[rank_cp.pokemon_id].name + ')\n';
                    });

                    if (match.mins >= 5) {

                        if (WDR.Config.POKEMON_PREGEN_TILES != 'DISABLED') {
                            if (sighting.static_map) {
                                match.body = sighting.body;
                                match.static_map = sighting.static_map;
                            } else {
                                match.body = await WDR.Generate_Tile(WDR, sighting, 'pokemon', match.lat, match.lon, match.tile_sprite);
                                sighting.body = match.body;
                                match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;
                                sighting.static_map = match.static_map;
                            }
                        }

                        if (WDR.Debug.Processing_Speed == 'ENABLED') {
                            let difference = Math.round((new Date().getTime() - sighting.WDR_Received) / 10) / 100;
                            match.footer = 'Latency: ' + difference + 's';
                        }

                        match.embed = Embed_Config(WDR, match);

                        WDR.Send_Embed(WDR, match.embed, channel.id);
                    }
                }
            }
        }
    }

    // END
    return;
};