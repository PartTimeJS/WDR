var Sent_Subscriptions = [];
setInterval(() => {
    Sent_Subscriptions = [];
}, 60000 * 60);

module.exports = (WDR, sighting) => {

    if (WDR.Pokemon_Channels.length < 1) {
        return;
    }

    if(sighting.hash){
        if(Sent_Subscriptions.includes(sighting.hash)){
            return;
        } else {
            Sent_Subscriptions.push(sighting.hash);
        }  
    }

    WDR.Pokemon_Channels.forEach(async feed_channel => {

        let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
        if (!channel) {
            return WDR.Console.error(WDR, '[feeds/pokemon.js] The channel ' + feed_channel[0] + ' does not appear to exist.');
        }

        channel.geofences = feed_channel[1].geofences.split(',');
        if (!channel.geofences) {
            return WDR.Console.error(WDR, '[feeds/pokemon.js] You do not have a Geofences set for ' + feed_channel[1] + '.');
        }

        channel.filter = WDR.Filters.get(feed_channel[1].filter);
        if (!channel.filter) {
            return WDR.Console.error(WDR, '[feeds/pokemon.js] The filter defined for ' + feed_channel[0] + ' does not appear to exist.');
        }

        if (channel.filter.Type != 'pokemon') {
            return WDR.Console.error(WDR, '[feeds/pokemon.js] The filter defined for ' + feed_channel[0] + ' does not appear to be a pokemon filter.');
        }

        if (feed_channel[1].roleid) {
            if (feed_channel[1].roleid == 'here' || feed_channel[1].roleid == 'everyone') {
                channel.role_id = '@' + feed_channel[1].roleid;
            } else {
                channel.role_id = '<@&' + feed_channel[1].roleid + '>';
            }
        }

        let pobject = channel.filter[WDR.Master.Pokemon[sighting.pokemon_id].name];
        if (!pobject) {
            return WDR.Console.error(WDR, `[feeds/pokemon.js] Missing filter data for ${WDR.Master.Pokemon[sighting.pokemon_id].name} (${sighting.pokemon_id}) in configs/filters/${feed_channel[1].filter}`);
        } else if (pobject != 'False') {

            let defGeo = (channel.geofences.indexOf(sighting.area.default) >= 0);
            let mainGeo = (channel.geofences.indexOf(sighting.area.main) >= 0);
            let subGeo = (channel.geofences.indexOf(sighting.area.sub) >= 0);
            if (defGeo || mainGeo || subGeo) {

                let criteria = {};

                criteria.gender = (channel.filter.gender == undefined ? 'all' : channel.filter.gender).toLowerCase();
                criteria.size = (channel.filter.size == undefined ? 'all' : channel.filter.size).toLowerCase();
                criteria.generation = channel.filter.generation == undefined ? 'all' : channel.filter.generation;
                criteria.min_iv = channel.filter.min_iv == undefined ? 0 : channel.filter.min_iv;
                criteria.max_iv = channel.filter.max_iv == undefined ? 100 : channel.filter.max_iv;
                criteria.min_level = channel.filter.min_level == undefined ? 0 : channel.filter.min_level;
                criteria.max_level = channel.filter.max_level == undefined ? 35 : channel.filter.max_level;

                if (pobject != 'True') {
                    criteria.gender = (pobject.gender == undefined ? criteria.gender : pobject.gender).toLowerCase();
                    criteria.size = (pobject.size == undefined ? criteria.size : pobject.size).toLowerCase();
                    criteria.generation = pobject.generation == undefined ? criteria.generation : pobject.generation;
                    criteria.min_iv = pobject.min_iv == undefined ? criteria.min_iv : pobject.min_iv;
                    criteria.max_iv = pobject.max_iv == undefined ? criteria.max_iv : pobject.max_iv;
                    criteria.min_level = pobject.min_level == undefined ? criteria.min_level : pobject.min_level;
                    criteria.max_level = pobject.max_level == undefined ? criteria.max_level : pobject.max_level;
                }

                let lvlPass = ((criteria.min_level <= sighting.pokemon_level) && (criteria.max_level >= sighting.pokemon_level));
                let sizePass = ((criteria.size == 'all') || (criteria.size == sighting.size));
                let genderPass = ((criteria.gender == 'all') || (criteria.gender == sighting.gender_name));
                let genPass = ((criteria.generation == 'all') || (criteria.generation == sighting.gen));
                let ivPass = ((criteria.min_iv <= sighting.internal_value) && (criteria.max_iv >= sighting.internal_value));
                if (lvlPass && sizePass && genderPass && genPass && ivPass) {

                    let match = {};

                    let Embed_Config = require(WDR.Dir + '/configs/embeds/' + (feed_channel[1].embed ? feed_channel[1].embed : 'pokemon_iv.js'));

                    match.typing = await WDR.Get_Typing(WDR, {
                        pokemon_id: sighting.pokemon_id,
                        form: sighting.form
                    });

                    match.sprite = WDR.Get_Sprite(WDR, sighting);

                    match.type = match.typing.type;
                    match.type_noemoji = match.typing.type_noemoji;

                    match.color = match.typing.color;
          
                    match.gender_wemoji = sighting.gender_wemoji;
                    match.gender_noemoji = sighting.gender_noemoji;

                    match.name = sighting.pokemon_name;
                    match.id = sighting.pokemon_id;
                    match.form = sighting.form_name ? sighting.form_name : '';
                    match.form = sighting.form_name == '[Normal]' ? '' : sighting.form_name;

                    match.map_url = sighting.discord.map_url;
                    match.subscribe_url = sighting.discord.subscribe_url;

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

                        if (WDR.Config.POKEMON_PREGEN_TILES != 'DISABLED') {
                            if (sighting.static_map) {
                                match.static_map = sighting.static_map;
                            } else {
                                match.body = await WDR.Generate_Tile(WDR, sighting, 'pokemon', match.lat, match.lon, match.sprite);
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
    });

    // END
    return;
};
