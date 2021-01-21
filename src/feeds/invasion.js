module.exports = async (WDR, INVASION) => {

    // RETURN IF NO CHANNELS ARE SET
    if (!WDR.Invasion_Channels) {
        return;
    }

    // CHECK FOR GRUNT TYPE
    if (!WDR.Master.Grunt_Types[INVASION.grunt_type]) {
        console.log(WDR.Master.Grunt_Types);
        return WDR.Console.error(WDR, '[feeds/INVASION.js] No Grunt found for ' + INVASION.grunt_type + ' in Grunts.json.');
    }

    INVASION.type = WDR.Master.Grunt_Types[INVASION.grunt_type].type;
    INVASION.gender = WDR.Master.Grunt_Types[INVASION.grunt_type].grunt;

    for (let c = 0, ch_len = WDR.Invasion_Channels.length; c < ch_len; c++) {

        let feed_channel = WDR.Invasion_Channels[c];

        let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
        if (!channel) {
            return WDR.Console.error(WDR, '[feeds/INVASION.js] The channel ' + feed_channel[0] + ' does not appear to exist.');
        }

        channel.Geofences = feed_channel[1].geofences.split(',');
        if (!channel.Geofences) {
            return WDR.Console.error(WDR, '[feeds/INVASION.js] You do not have a Geofences set for ' + feed_channel[1] + '.');
        }

        channel.Filter = WDR.Filters.get(feed_channel[1].filter);
        if (!channel.Filter) {
            return WDR.Console.error(WDR, '[feeds/INVASION.js] The filter defined for ' + feed_channel[0] + ' does not appear to exist.');
        }

        if (channel.Filter.Type != 'invasion') {
            return WDR.Console.error(WDR, '[feeds/INVASION.js] The filter defined for ' + feed_channel[0] + ' does not appear to be a invasion filter.');
        }

        if (feed_channel[1].roleid) {
            if (feed_channel[1].roleid == 'here' || feed_channel[1].roleid == 'everyone') {
                INVASION.role_id = '@' + feed_channel[1].roleid;
            } else {
                INVASION.role_id = '<@&' + feed_channel[1].roleid + '>';
            }
        }

        switch (true) {
            case (channel.Geofences.indexOf('ALL') >= 0):
            case (channel.Geofences.indexOf(INVASION.area.default) >= 0):
            case (channel.Geofences.indexOf(INVASION.area.main) >= 0):
            case (channel.Geofences.indexOf(INVASION.area.sub) >= 0):

                switch (true) {
                    case !channel.Filter[INVASION.type]:
                        break;
                    case (channel.Filter[INVASION.type].toLowerCase() == 'all'):
                    case (channel.Filter[INVASION.type].toLowerCase() == INVASION.gender.toLowerCase()):

                        var Embed_Config = require(WDR.Dir + '/configs/embeds/' + (feed_channel[1].embed ? feed_channel[1].embed : 'invasion.js'));

                        var match = {};
            
                        match.type = WDR.Master.Grunt_Types[INVASION.grunt_type].type;

                        match.name = INVASION.name;
                        match.url = INVASION.url ? INVASION.url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png';

                        match.weaknesses = '';
                        match.resistances = '';
                        //INVASION.type = WDR.Emotes[INVASION.grunt_type.toLowerCase()] ? WDR.Emotes[INVASION.grunt_type.toLowerCase()] : "";
                        match.color = WDR.Get_Type_Color(WDR.Master.Grunt_Types[INVASION.grunt_type].type);
                        match.time = WDR.Time(INVASION.incident_expire_timestamp, '1', INVASION.timezone);
                        match.mins = Math.floor((INVASION.incident_expire_timestamp - (INVASION.time_now / 1000)) / 60);
                        match.secs = Math.floor((INVASION.incident_expire_timestamp - (INVASION.time_now / 1000)) - ((Math.floor((INVASION.incident_expire_timestamp - (INVASION.time_now / 1000)) / 60)) * 60));
                        match.lat = INVASION.latitude;
                        match.lon = INVASION.longitude;
                        match.area = INVASION.area.embed;
                        match.map_url = WDR.Config.FRONTEND_URL;

                        match.google = '[Google Maps](https://www.google.com/maps?q=' + match.lat + ',' + match.lon + ')';
                        match.apple = '[Apple Maps](http://maps.apple.com/maps?daddr=' + match.lat + ',' + match.lon + '&z=10&t=s&dirflg=d)';
                        match.waze = '[Waze](https://www.waze.com/ul?ll=' + match.lat + ',' + match.lon + '&navigate=yes)';
                        match.pmsf = '[Scan Map](' + WDR.Config.FRONTEND_URL + '?lat=' + match.lat + '&lon=' + match.lon + '&zoom=15)';
                        match.rdm = '[Scan Map](' + WDR.Config.FRONTEND_URL + '@/' + match.lat + '/' + match.lon + '/15)';

                        match.encounters = 'Unknown';
                        match.battles = 'Unknown';
                        match.first = '';
                        match.second = '';
                        match.third = '';

                        // if(type == "Tier II" && WDR.Master.Grunt_Types[INVASION.grunt_type].encounters){ type = WDR.Master.Pokemon[parseInt(WDR.Master.Grunt_Types[INVASION.grunt_type].encounters.first[0].split("_")[0])].types[0] }
                        // if(type != "Tier II" && WDR.types[type]){
                        //   WDR.types[type].resistances.forEach((resistance,index) => {
                        //     WDR.types[type].weaknesses.forEach((weakness,index) => {
                        //       if(INVASION.weaknesses.indexOf(WDR.Emotes[weakness.toLowerCase()]) < 0){
                        //         INVASION.weaknesses += WDR.Emotes[weakness.toLowerCase()]+" ";
                        //       }
                        //       if(INVASION.resistances.indexOf(WDR.Emotes[resistance.toLowerCase()]) < 0){
                        //         INVASION.resistances += WDR.Emotes[resistance.toLowerCase()]+" ";
                        //       }
                        //     });
                        //   });
                        // }

                        if (!match.resistances || match.resistances.trim() == 'undefined') {
                            match.resistances = 'None';
                        }

                        if (!match.weaknesses || match.weaknesses.trim() == 'undefined') {
                            match.weaknesses = 'None';
                        }

                        switch (WDR.Master.Grunt_Types[INVASION.grunt_type].grunt) {
                            case 'Male':
                                match.sprite = 'https://cdn.discordapp.com/attachments/487387866394263552/605492063768936451/male_grunt_face_pink.png';
                                match.gender = ' ' + WDR.Emotes.male;
                                break;
                            case 'Female':
                                match.sprite = 'https://cdn.discordapp.com/attachments/487387866394263552/605492065643659315/female_grunt_face_pink.png';
                                match.gender = ' ' + WDR.Emotes.female;
                                break;
                            default:
                                match.sprite = 'https://i.imgur.com/aAS6VUM.png';
                                match.gender = '';
                        }

                        match.marker_latitude = match.lat + .00045;
                        //
                        // match.static_marker = [{
                        //     "url": "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/other/Pokestop_Expanded_Rocket.png",
                        //     "height": 62,
                        //     "width": 50,
                        //     "x_offset": 0,
                        //     "y_offset": 0,
                        //     "latitude": match.marker_latitude,
                        //     "longitude": match.lon
                        //   },
                        //   {
                        //     "url": match.sprite,
                        //     "height": 40,
                        //     "width": 40,
                        //     "x_offset": 0,
                        //     "y_offset": -45,
                        //     "latitude": match.marker_latitude,
                        //     "longitude": match.lon
                        //   }
                        // ];
                        //
                        // match.static_map = WDR.Config.STATIC_MAP_URL + "&latitude=" + match.marker_latitude + "&longitude=" + match.lon + "&zoom=" + WDR.Config.STATIC_ZOOM + "&width=" + WDR.Config.STATIC_WIDTH + "&height=" + WDR.Config.STATIC_HEIGHT + "&scale=2&markers=" + encodeURIComponent(JSON.stringify(match.static_marker));

                        if (WDR.Master.Grunt_Types[INVASION.grunt_type].encounters) {
                            let name = '';
                            if (WDR.Master.Grunt_Types[INVASION.grunt_type].encounters.first) {
                                WDR.Master.Grunt_Types[INVASION.grunt_type].encounters.first.forEach((id) => {
                                    if (WDR.Emotes[WDR.Master.Pokemon[id].name] != undefined) {
                                        name = WDR.Emotes[WDR.Master.Pokemon[id].name];
                                    } else {
                                        name = WDR.Master.Pokemon[id].name;
                                    }
                                    match.first += name + ' ';
                                });
                            }

                            if (WDR.Master.Grunt_Types[INVASION.grunt_type].encounters.second) {
                                WDR.Master.Grunt_Types[INVASION.grunt_type].encounters.second.forEach((id) => {
                                    if (WDR.Emotes[WDR.Master.Pokemon[id].name] != undefined) {
                                        name = WDR.Emotes[WDR.Master.Pokemon[id].name];
                                    } else {
                                        name = WDR.Master.Pokemon[id].name;
                                    }
                                    if (match.first.indexOf(name) < 0 && match.first.indexOf(WDR.Emotes[WDR.Master.Pokemon[id].name]) < 0) {
                                        match.second += name + ' ';
                                    }
                                });
                            }

                            if (WDR.Master.Grunt_Types[INVASION.grunt_type].encounters.third) {
                                WDR.Master.Grunt_Types[INVASION.grunt_type].encounters.third.forEach((id) => {
                                    if (WDR.Emotes[WDR.Master.Pokemon[id].name] != undefined) {
                                        name = WDR.Emotes[WDR.Master.Pokemon[id].name];
                                    } else {
                                        name = WDR.Master.Pokemon[id].name;
                                    }
                                    if (match.first.indexOf(name) < 0 && match.second.indexOf(name) < 0 && match.first.indexOf(WDR.Emotes[WDR.Master.Pokemon[id].name]) < 0 && match.second.indexOf(WDR.Emotes[WDR.Master.Pokemon[id].name]) < 0) {
                                        match.third += name + ' ';
                                    }
                                });
                            }
                        }

                        if (WDR.Master.Grunt_Types[INVASION.grunt_type].second_reward && WDR.Master.Grunt_Types[INVASION.grunt_type].second_reward == 'true') {
                            match.encounters = '';
                            match.encounters += '**85% Chance to Encounter**:\n ' + match.first + '\n';
                            match.encounters += '**15% Chance to Encounter**:\n ' + match.second + '\n';
                        } else if (WDR.Master.Grunt_Types[INVASION.grunt_type].encounters) {
                            match.encounters = '';
                            match.encounters += '**100% Chance to Encounter**:\n ' + match.first + '\n';
                            //   if (match.first.length <= 25) {
                            //     match.pokemon_id = parseInt(WDR.Master.Grunt_Types[INVASION.grunt_type].encounters.first[0]);
                            //     match.sprite = WDR.Get_Sprite(WDR, INVASION);
                            //   }
                        }

                        match.grunt_gender = WDR.Master.Grunt_Types[INVASION.grunt_type].grunt;
                        match.grunt_type = WDR.Master.Grunt_Types[INVASION.grunt_type].type;


                        if (match.mins > 5) {

                            match.body = await WDR.Generate_Tile(WDR, INVASION, 'invasions', match.marker_latitude, match.lon, match.sprite);
                            match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;

                            match.embed = Embed_Config(WDR, match);

                            WDR.Send_Embed(WDR, match.embed, channel.id);
                        }
                }
        }
    }

    // END
    return;
};