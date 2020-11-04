module.exports = async (WDR, RAID) => {

    if (WDR.Raid_Channels.length < 1) {
        return;
    }

    if (RAID.cp > 0 || RAID.is_exclusive == true) {
        RAID.Type = 'Boss';
        RAID.which = 'raid';
    } else {
        RAID.Type = 'Egg';
    }

    for (let c = 0, clen = WDR.Raid_Channels.length; c < clen; c++) {
        let feed_channel = WDR.Raid_Channels[c];

        let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
        if (!channel) {
            return WDR.Console.error(WDR, '[feeds/raids.js] The channel ' + feed_channel[0] + ' does not appear to exist.');
        }

        channel.geofences = feed_channel[1].geofences.split(',');
        if (!channel.geofences) {
            return WDR.Console.error(WDR, '[feeds/raids.js] You do not have a Geofences set for ' + feed_channel[1] + '.');
        }

        channel.filter = WDR.Filters.get(feed_channel[1].filter);
        if (!channel.filter) {
            return WDR.Console.error(WDR, '[feeds/raids.js] The filter defined for ' + feed_channel[0] + ' does not appear to exist.');
        }

        if (channel.filter.Type != 'raid') {
            return WDR.Console.error(WDR, '[feeds/raids.js] The filter defined for ' + feed_channel[0] + ' does not appear to be a raid filter.');
        }

        if (feed_channel[1].roleid) {
            if (feed_channel[1].roleid == 'here' || feed_channel[1].roleid == 'everyone') {
                RAID.role_id = '@' + feed_channel[1].roleid;
            } else {
                RAID.role_id = '<@&' + feed_channel[1].roleid + '>';
            }
        }

        let defGeo = (channel.geofences.indexOf(RAID.area.default) >= 0);
        let mainGeo = (channel.geofences.indexOf(RAID.area.main) >= 0);
        let subGeo = (channel.geofences.indexOf(RAID.area.sub) >= 0);
        if (defGeo || mainGeo || subGeo) {

            let matchedEgg = (RAID.Type == 'Egg' && (channel.filter.Egg_Levels.indexOf(RAID.level) >= 0));
            let matchedBoss = (RAID.Type == 'Boss' && (channel.filter.Boss_Levels.indexOf(RAID.level) >= 0 || channel.filter.Boss_Levels.indexOf(RAID.pokemon_name) >= 0));
            if (matchedEgg || matchedBoss) {

                let matchedEx = (!channel.filter.Ex_Eligible_Only || channel.filter.Ex_Eligible_Only == false || channel.filter.Ex_Eligible_Only == RAID.ex_raid_eligible);
                if (matchedEx) {

                    let Embed_Config;
                    if (RAID.Type == 'Egg') {
                        if (!feed_channel[1].embed_egg && !feed_channel[1].embed) {
                            Embed_Config = require(WDR.Dir + '/configs/embeds/raid_eggs.js');
                        } else if (feed_channel[1].embed_egg) {
                            Embed_Config = require(WDR.Dir + '/configs/embeds/' + feed_channel[1].embed_egg);
                        } else {
                            Embed_Config = require(WDR.Dir + '/configs/embeds/' + (feed_channel[1].embed ? feed_channel[1].embed : 'raid_egg.js'));
                        }
                    } else {
                        Embed_Config = require(WDR.Dir + '/configs/embeds/' + (feed_channel[1].embed ? feed_channel[1].embed : 'raid_boss.js'));
                    }

                    let match = {};

                    match.id = RAID.gym_id;
                    match.boss = RAID.pokemon_name ? RAID.pokemon_name : 'Egg';
                    match.lvl = RAID.level;
                    match.gym = RAID.gym_name ? RAID.gym_name : 'No Name';

                    if (WDR.Gym_Notes && WDR.Gym_Notes[RAID.gym_id]) {
                        match.notes = WDR.Gym_Notes[RAID.gym_id] ? WDR.Gym_Notes[RAID.gym_id].description : '';
                    } else {
                        match.notes = '';
                    }

                    match.exraid = RAID.is_exclusive ? '**EXRaid Invite Only**\n' : '';
                    match.sponsor = (RAID.sponsor_id || RAID.ex_raid_eligible) ? WDR.Emotes.exPass + ' Eligible' : '';

                    match.lat = RAID.latitude;
                    match.lon = RAID.longitude;
                    match.area = RAID.area.embed;

                    match.map_img = '';
                    match.map_url = WDR.Config.FRONTEND_URL;

                    match.google = '[Google Maps](https://www.google.com/maps?q=' + match.lat + ',' + match.lon + ')';
                    match.apple = '[Apple Maps](http://maps.apple.com/maps?daddr=' + match.lat + ',' + match.lon + '&z=10&t=s&dirflg=d)';
                    match.waze = '[Waze](https://www.waze.com/ul?ll=' + match.lat + ',' + match.lon + '&navigate=yes)';
                    match.pmsf = '[Scan Map](' + WDR.Config.FRONTEND_URL + '?lat=' + match.lat + '&lon=' + match.lon + '&zoom=15)';
                    match.rdm = '[Scan Map](' + WDR.Config.FRONTEND_URL + '@/' + match.lat + '/' + match.lon + '/15)';

                    if (RAID.team_id === 1) {
                        match.team = WDR.Emotes.mystic + ' Control';
                    } else if (RAID.team_id === 2) {
                        match.team = WDR.Emotes.valor + ' Control';
                    } else if (RAID.team_id === 3) {
                        match.team = WDR.Emotes.instinct + ' Control';
                    } else if (RAID.team_id === 4) {
                        match.team = 'Your Mom\'s Control';
                    } else {
                        RAID.team_id = 0;
                        match.team = 'Uncontested Gym';
                    }

                    match.embed_image = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/wdr/gyms/' + RAID.team_id + '.png';

                    match.url = RAID.gym_url ? RAID.gym_url : 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/wdr/teams/' + RAID.team_id + '.png';

                    if (RAID.level === 1 || RAID.level === 2) {
                        match.color = 'f358fb';
                    } else if (RAID.level === 3 || RAID.level === 4) {
                        match.color = 'ffd300';
                    } else if (RAID.level === 5) {
                        match.color = '5b00de';
                    } else if (RAID.level === 6) {
                        match.color = 'a53820';
                    }

                    match.hatch_time = WDR.Time(RAID.start, '1', RAID.timezone);
                    match.end_time = WDR.Time(RAID.end, '1', RAID.timezone);
                    match.hatch_mins = Math.floor((RAID.start - (RAID.time_now / 1000)) / 60);
                    match.end_mins = Math.floor((RAID.end - (RAID.time_now / 1000)) / 60);

                    match.marker_latitude = RAID.latitude + .0006;

                    if (RAID.Type == 'Egg') {
                        match.sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/wdr/eggs/' + RAID.level + '.png';
                    } else {
                        match.sprite = WDR.Get_Sprite(WDR, RAID);
                        match.form = RAID.form_name ? RAID.form_name : '';
                        match.form = match.form == '[Normal]' ? '' : match.form;
                        match.typing = await WDR.Get_Typing(WDR, RAID);
                        match.type = match.typing.type;
                        match.type_noemoji = match.typing.type_noemoji;
                        match.weaknesses = match.typing.weaknesses;
                        match.resistances = match.typing.resistances;
                        match.reduced = match.typing.reduced;
                        match.move_1_type = WDR.Emotes[WDR.Master.Moves[RAID.move_1].type.toLowerCase()];
                        match.move_2_type = WDR.Emotes[WDR.Master.Moves[RAID.move_2].type.toLowerCase()];
                        match.move_1_name = RAID.move_1_name;
                        match.move_2_name = RAID.move_2_name;
                        match.minCP = WDR.PvP.CalculateCP(WDR, RAID.pokemon_id, RAID.form_id, 10, 10, 10, 20);
                        match.maxCP = WDR.PvP.CalculateCP(WDR, RAID.pokemon_id, RAID.form_id, 15, 15, 15, 20);
                        match.minCP_boosted = WDR.PvP.CalculateCP(WDR, RAID.pokemon_id, RAID.form_id, 10, 10, 10, 25);
                        match.maxCP_boosted = WDR.PvP.CalculateCP(WDR, RAID.pokemon_id, RAID.form_id, 15, 15, 15, 25);
                    }

                    if (WDR.Debug.Processing_Speed == 'ENABLED') {
                        let difference = Math.round((new Date().getTime() - RAID.WDR_Received) / 10) / 100;
                        match.footer = 'Latency: ' + difference + 's';
                    }

                    if (WDR.Config.RAID_PREGEN_TILES != 'DISABLED') {
                        if (RAID.static_map) {
                            match.body = RAID.body;
                            match.static_map = RAID.static_map;
                        } else {
                            match.body = await WDR.Generate_Tile(WDR, RAID, 'raids', match.marker_latitude, match.lon, match.embed_image, match.sprite);
                            RAID.body = match.body;
                            match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;
                            RAID.static_map = match.static_map;
                        }
                    }

                    match.embed = await Embed_Config(WDR, match);

                    WDR.Send_Embed(WDR, match.embed, channel.id);
                }
            }
        }
    }

    // END
    return;
};