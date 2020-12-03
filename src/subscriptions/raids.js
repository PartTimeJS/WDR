var Sent_Subscriptions = [];
setInterval(() => {
    Sent_Subscriptions = [];
}, 60000 * 60);

module.exports = async (WDR, raid) => {

    let discord = raid.discord;

    let query = `
        SELECT
            *
        FROM
            wdr_raid_subs
        WHERE
            status = 1
        AND (
            pokemon_id <= 0
                OR
            pokemon_id = ${raid.pokemon_id}
        )
        AND (
            max_lvl = 0
                OR
            max_lvl >= ${raid.level}
        )
        AND (
            min_lvl = 0
                OR
            min_lvl <= ${raid.level}
        )
        AND (
            gym_id = '0'
                OR
            gym_id = '${raid.gym_id}'
        )
    ;`;

    WDR.wdrDB.query(
        query,
        async function (error, matching) {
            if (error) {
                WDR.Console.error(WDR, '[cmd/sub/raid/remove.js] Error Fetching Subscriptions to Create Subscription.', [query, error]);
            } else if (matching && matching[0]) {

                if(raid.hash){
                    if(Sent_Subscriptions.includes(raid.hash)){
                        return;
                    } else {
                        Sent_Subscriptions.push(raid.hash);
                    }  
                }

                for (let m = 0, mlen = matching.length; m < mlen; m++) {

                    let User = matching[m];

                    User.location = JSON.parse(User.location);

                    let bossCheck = (User.pokemon_id >= 0);
                    let allRaids = (User.pokemon_id === -1);
                    let allEggs = (User.pokemon_id === -2 && raid.pokemon_id < 1);
                    if (bossCheck || allRaids || allEggs) {

                        let authorized = await WDR.Authorize(WDR, discord.id, User.user_id, discord.allowed_roles);
                        if (authorized) {

                            if (User.geotype == 'city') {
                                if (User.guild_name == raid.area.default) {
                                    if (WDR.Config.DEBUG.Raid_Subs == 'ENABLED') {
                                        WDR.Console.log(WDR, '[DEBUG] [src/subs/raids.js] ' + raid.gym_id + ' | Sent city sub to ' + User.user_name + '.');
                                    }
                                    Send_Subscription(WDR, raid, User);
                                } else if (WDR.Config.DEBUG.Raid_Subs == 'ENABLED') {
                                    WDR.Console.info(WDR, '[DEBUG] [src/subs/raids.js] ' + raid.gym_id + ' | User: ' + User.user_name + ' | Failed City Geofence. Wanted: `' + User.guild_name + '` Saw: `' + raid.area.default+'`');
                                }

                            } else if (User.geotype == 'areas') {
                                let defGeo = (User.areas.indexOf(raid.area.default) >= 0);
                                let mainGeo = (User.areas.indexOf(raid.area.main) >= 0);
                                let subGeo = (User.areas.indexOf(raid.area.sub) >= 0);
                                if (defGeo || mainGeo || subGeo) {
                                    if (WDR.Config.DEBUG.Raid_Subs == 'ENABLED') {
                                        WDR.Console.log(WDR, '[DEBUG] [src/subs/raids.js] ' + raid.gym_id + ' | Sent area sub to ' + User.user_name + '.');
                                    }
                                    Send_Subscription(WDR, raid, User);
                                } else if (WDR.Config.DEBUG.Raid_Subs == 'ENABLED') {
                                    WDR.Console.info(WDR, '[DEBUG] [src/subs/raids.js] ' + raid.gym_id + ' | User: ' + User.user_name + ' | Failed Area Geofence.');
                                }

                            } else if (User.geotype == 'location') {
                                let distance = WDR.Distance.between({
                                    lat: raid.latitude,
                                    lon: raid.longitude
                                }, {
                                    lat: User.location.coords.split(',')[0],
                                    lon: User.location.coords.split(',')[1]
                                });
                                let loc_dist = WDR.Distance(parseInt(User.location.radius) + ' km');
                                if (loc_dist > distance) {
                                    if (WDR.Config.DEBUG.Raid_Subs == 'ENABLED') {
                                        WDR.Console.log(WDR, '[DEBUG] [src/subs/raids.js] ' + raid.gym_id + ' | Sent location sub to ' + User.user_name + '.');
                                    }
                                    Send_Subscription(WDR, raid, User);
                                }
                            } else {
                                WDR.Console.error(WDR, '[DEBUG] [src/subs/raids.js] User: ' + User.user_name + ' | User geotype has a bad value.', User);
                            }
                        } else if (WDR.Config.DEBUG.Raid_Subs == 'ENABLED') {
                            WDR.Console.info(WDR, '[DEBUG] [src/subs/raids.js] ' + raid.gym_id + ' | ' + User.user_name + ' IS NOT an Authorized User in ' + discord.name + ' (' + discord.id + ').');
                        }
                    }
                }
            }
        }
    );

    // END
    return;
};

async function Send_Subscription(WDR, raid, User) {

    await WDR.Rate_Limit(WDR, User);

    let match = {};

    let Embed_Config;
    if (raid.cp > 0 || raid.is_exclusive == true) {
        Embed_Config = require(WDR.Dir + '/configs/embeds/raid_boss.js');
    } else {
        Embed_Config = require(WDR.Dir + '/configs/embeds/raid_eggs.js');
    }

    match.id = raid.gym_id;
    match.boss = raid.pokemon_name ? raid.pokemon_name : 'Egg';
    match.lvl = raid.level;
    match.gym = raid.gym_name ? raid.gym_name : 'No Name';

    if (WDR.Gym_Notes && WDR.Gym_Notes[raid.gym_id]) {
        match.notes = WDR.Gym_Notes[raid.gym_id] ? WDR.Gym_Notes[raid.gym_id].description : '';
    } else {
        match.notes = '';
    }

    match.exraid = raid.is_exclusive ? '**EXRaid Invite Only**\n' : '';
    match.sponsor = (raid.sponsor_id || raid.ex_raid_eligible) ? WDR.Emotes.exPass + ' Eligible' : '';

    match.lat = raid.latitude;
    match.lon = raid.longitude;
    match.area = raid.area.embed;

    match.map_img = '';
    match.map_url = WDR.Config.FRONTEND_URL;

    match.google = '[Google Maps](https://www.google.com/maps?q=' + match.lat + ',' + match.lon + ')';
    match.apple = '[Apple Maps](http://maps.apple.com/maps?daddr=' + match.lat + ',' + match.lon + '&z=10&t=s&dirflg=d)';
    match.waze = '[Waze](https://www.waze.com/ul?ll=' + match.lat + ',' + match.lon + '&navigate=yes)';
    match.pmsf = '[Scan Map](' + WDR.Config.FRONTEND_URL + '?lat=' + match.lat + '&lon=' + match.lon + '&zoom=15)';
    match.rdm = '[Scan Map](' + WDR.Config.FRONTEND_URL + '@/' + match.lat + '/' + match.lon + '/15)';

    if (raid.team_id === 1) {
        match.team = WDR.Emotes.mystic + ' Control';
    } else if (raid.team_id === 2) {
        match.team = WDR.Emotes.valor + ' Control';
    } else if (raid.team_id === 3) {
        match.team = WDR.Emotes.instinct + ' Control';
    } else if (raid.team_id === 4) {
        match.team = 'Your Mom\'s Control';
    } else {
        raid.team_id = 0;
        match.team = 'Uncontested Gym';
    }

    match.embed_image = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/wdr/gyms/' + raid.team_id + '.png';

    match.url = raid.gym_url ? raid.gym_url : 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/wdr/teams/' + raid.team_id + '.png';

    if (raid.level === 1 || raid.level === 2) {
        match.color = 'f358fb';
    } else if (raid.level === 3 || raid.level === 4) {
        match.color = 'ffd300';
    } else if (raid.level === 5) {
        match.color = '5b00de';
    } else if (raid.level === 6) {
        match.color = 'a53820';
    }

    match.hatch_time = WDR.Time(raid.start, '1', raid.timezone);
    match.end_time = WDR.Time(raid.end, '1', raid.timezone);
    match.hatch_mins = Math.floor((raid.start - (raid.time_now / 1000)) / 60);
    match.end_mins = Math.floor((raid.end - (raid.time_now / 1000)) / 60);

    match.marker_latitude = raid.latitude + .0006;

    if (raid.Type == 'Egg') {
        match.sprite = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/wdr/eggs/' + raid.level + '.png';
    } else {
        match.sprite = WDR.Get_Sprite(WDR, raid);
        match.form = raid.form_name ? raid.form_name : '';
        match.form = match.form == '[Normal]' ? '' : match.form;
        match.typing = await WDR.Get_Typing(WDR, raid);
        match.type = match.typing.type;
        match.type_noemoji = match.typing.type_noemoji;
        match.weaknesses = match.typing.weaknesses;
        match.resistances = match.typing.resistances;
        match.reduced = match.typing.reduced;
        match.move_1_type = WDR.Emotes[WDR.Master.Moves[raid.move_1].type.toLowerCase()];
        match.move_2_type = WDR.Emotes[WDR.Master.Moves[raid.move_2].type.toLowerCase()];
        match.move_1_name = raid.move_1_name;
        match.move_2_name = raid.move_2_name;
        match.minCP = WDR.PvP.CalculateCP(WDR, raid.pokemon_id, raid.form_id, 10, 10, 10, 20);
        match.maxCP = WDR.PvP.CalculateCP(WDR, raid.pokemon_id, raid.form_id, 15, 15, 15, 20);
        match.minCP_boosted = WDR.PvP.CalculateCP(WDR, raid.pokemon_id, raid.form_id, 10, 10, 10, 25);
        match.maxCP_boosted = WDR.PvP.CalculateCP(WDR, raid.pokemon_id, raid.form_id, 15, 15, 15, 25);
    }

    if (WDR.Debug.Processing_Speed == 'ENABLED') {
        let difference = Math.round((new Date().getTime() - raid.WDR_Received) / 10) / 100;
        match.footer = 'Latency: ' + difference + 's';
    }

    if (WDR.Config.RAID_PREGEN_TILES != 'DISABLED') {
        if (raid.static_map) {
            match.body = raid.body;
            match.static_map = raid.static_map;
        } else {
            match.body = await WDR.Generate_Tile(WDR, raid, 'raids', match.marker_latitude, match.lon, match.embed_image, match.sprite);
            raid.body = match.body;
            match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;
            raid.static_map = match.static_map;
        }
    }

    match.embed = await Embed_Config(WDR, match);

    WDR.Send_DM(WDR, User.guild_id, User.user_id, match.embed, User.bot);
}