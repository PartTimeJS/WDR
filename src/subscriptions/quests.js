module.exports = async (WDR, QUEST) => {

    let discord = QUEST.discord;
    
    let params = '';
    if(QUEST.pokemon_id){
        params = `reward = '${WDR.Master.Pokemon[QUEST.pokemon_id].name}'`;
    } else {
        params =   `(
                        reward = '${QUEST.simple_reward}'
                            OR
                        reward = '${QUEST.full_reward}'
                    )`;
    }

    let query = `
        SELECT
            *
        FROM
            wdr_quest_subs
        WHERE
            status = 1
        AND 
            ${params}
    ;`;

    if(QUEST.simple_reward.toLowerCase() == 'rare candy'){
        console.error(query);
    }

    WDR.wdrDB.query(
        query,
        async function(error, matching) {
            if (error) {
                WDR.Console.error(WDR, '[src/subs/quests.js] Error Querying Subscriptions.', [query, error]);
            } else if (matching && matching.length > 0) {

                console.error('MATCHES FOUND!!!!!!!!!!!!!!!!!', matching);

                for (let m = 0, mlen = matching.length; m < mlen; m++) {

                    let User = matching[m];

                    User.location = JSON.parse(User.location);

                    let authorized = await WDR.Authorize(WDR, discord.id, User.user_id, discord.allowed_roles);
                    if (authorized) {

                        if (User.geotype == 'city') {
                            if (User.guild_name == QUEST.area.default) {
                                if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                    WDR.Console.log(WDR, '[DEBUG] [src/subs/quests.js] ' + QUEST.encounter_id + ' | Sent city sub to ' + User.user_name + '.');
                                }
                                Send_Subscription(WDR, QUEST, User);
                            } else if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                WDR.Console.info(WDR, '[DEBUG] [src/subs/quests.js] ' + QUEST.encounter_id + ' | User: ' + User.user_name + ' | Failed City Geofence. Wanted: `' + User.guild_name + '` Saw: `' + QUEST.area.default+'`');
                            }

                        } else if (User.geotype == 'areas') {
                            let defGeo = (User.areas.indexOf(QUEST.area.default) >= 0);
                            let mainGeo = (User.areas.indexOf(QUEST.area.main) >= 0);
                            let subGeo = (User.areas.indexOf(QUEST.area.sub) >= 0);
                            if (defGeo || mainGeo || subGeo) {
                                if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                    WDR.Console.log(WDR, '[DEBUG] [src/subs/quests.js] ' + QUEST.encounter_id + ' | Sent area sub to ' + User.user_name + '.');
                                }
                                Send_Subscription(WDR, QUEST, User);
                            } else if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                WDR.Console.info(WDR, '[DEBUG] [src/subs/quests.js] ' + QUEST.encounter_id + ' | User: ' + User.user_name + ' | Failed Area Geofence.');
                            }

                        } else if (User.geotype == 'location') {
                            let distance = WDR.Distance.between({
                                lat: QUEST.latitude,
                                lon: QUEST.longitude
                            }, {
                                lat: User.location.coords.split(',')[0],
                                lon: User.location.coords.split(',')[1]
                            });
                            let loc_dist = WDR.Distance(parseInt(User.location.radius) + ' km');
                            if (loc_dist > distance) {
                                if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                                    WDR.Console.log(WDR, '[DEBUG] [src/subs/quests.js] ' + QUEST.encounter_id + ' | Sent location sub to ' + User.user_name + '.');
                                }
                                Send_Subscription(WDR, QUEST, User);
                            }
                        } else {
                            WDR.Console.error(WDR, '[DEBUG] [src/subs/quests.js] User: ' + User.user_name + ' | User geotype has a bad value.', User);
                        }
                    } else if (WDR.Config.DEBUG.Pokemon_Subs == 'ENABLED') {
                        WDR.Console.info(WDR, '[DEBUG] [src/subs/quests.js] ' + QUEST.encounter_id + ' | ' + User.user_name + ' did NOT pass authorization for ' + discord.name + ' (' + discord.id + ').');
                    }
                }
            }
        }
    );

    // END
    return;
};

async function Send_Subscription(WDR, QUEST, User) {

    await WDR.Rate_Limit(WDR, User);

    let Embed_Config = require(WDR.Dir + '/configs/embeds/quests.js');

    let match = {};

    match.name = QUEST.pokestop_name;
    match.reward = QUEST.quest_reward;
    match.task = QUEST.task;
    match.form = QUEST.form_name;
    match.role_id = QUEST.role_id;

    match.lat = QUEST.latitude;
    match.lon = QUEST.longitude;
    match.area = QUEST.area.embed;
    match.url = QUEST.pokestop_url;
    match.map_url = WDR.Config.FRONTEND_URL;

    match.google = '[Google Maps](https://www.google.com/maps?q=' + match.lat + ',' + match.lon + ')';
    match.apple = '[Apple Maps](http://maps.apple.com/maps?daddr=' + match.lat + ',' + match.lon + '&z=10&t=s&dirflg=d)';
    match.waze = '[Waze](https://www.waze.com/ul?ll=' + match.lat + ',' + match.lon + '&navigate=yes)';
    match.pmsf = '[Scan Map](' + WDR.Config.FRONTEND_URL + '?lat=' + match.lat + '&lon=' + match.lon + '&zoom=15)';
    match.rdm = '[Scan Map](' + WDR.Config.FRONTEND_URL + '@/' + match.lat + '/' + match.lon + '/15)';
    match.mapjs = '[Scan Map](' + WDR.Config.FRONTEND_URL + '@/' + match.lat + '/' + match.lon + '/15)';

    match.sprite = WDR.Get_Sprite(WDR, QUEST);

    match.marker_latitude = QUEST.latitude + .0005;

    match.body = await WDR.Generate_Tile(WDR, QUEST, 'quests', match.marker_latitude, match.lon, match.sprite);
    match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;

    match.time = WDR.Time(null, 'quest', QUEST.timezone);

    switch (true) {
        case QUEST.template.indexOf('easy') >= 0:
            match.color = '00ff00';
            break;
        case QUEST.template.indexOf('moderate') >= 0:
            match.color = 'ffff00';
            break;
        case QUEST.template.indexOf('hard') >= 0:
            match.color = 'ff0000';
            break;
        default:
            match.color = '00ccff';
    }

    if (!match.sprite) {
        match.sprite = QUEST.url;
    }

    match.embed = Embed_Config(WDR, match);

    let db_date = WDR.Moment(QUEST.time_now).format('MM/DD/YYYY');
    db_date = WDR.Moment(db_date + ' ' + User.quest_time, 'MM/DD/YYYY H:mm').unix();
    
    let quest_object = JSON.stringify(QUEST);
    let embed = JSON.stringify(match.embed);

    let query = `
            INSERT INTO
                wdr_quest_queue (
                    user_id,
                    user_name,
                    guild_id,
                    bot,
                    area,
                    alert,
                    alert_time,
                    embed
                )
            VALUES
                ( 
                    '${User.user_id}',
                    '${User.user_name}',
                    '${User.guild_id}',
                    ${User.bot},
                    '${match.area}',
                    '${quest_object}', 
                    '${db_date}',
                    '${embed}'
                )
        ;`;

    WDR.wdrDB.query(
        query,
        function(error) {
            if (error) {
                WDR.Console.error(WDR, '[' + WDR.Time(null, 'stamp') + '] UNABLE TO ADD ALERT TO quest_alerts', [query, error]);
            }
        }
    );

    // END
    return;
}