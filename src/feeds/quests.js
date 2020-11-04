module.exports = async (WDR, QUEST) => {

    for (let c = 0, ch_len = WDR.Quest_Channels.length; c < ch_len; c++) {
        let feed_channel = WDR.Quest_Channels[c];

        let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
        if (!channel) {
            return WDR.Console.error(WDR, '[feeds/quests.js] The channel ' + feed_channel[0] + ' does not appear to exist.');
        }

        channel.geofences = feed_channel[1].geofences.split(',');
        if (!channel.geofences) {
            return WDR.Console.error(WDR, '[feeds/quests.js] You do not have a Geofences set for ' + feed_channel[1] + '.');
        }

        channel.filter = WDR.Filters.get(feed_channel[1].filter);
        if (!channel.filter) {
            return WDR.Console.error(WDR, '[feeds/quests.js] The filter defined for ' + feed_channel[0] + ' does not appear to exist.');
        }

        if (channel.filter.Type != 'quest') {
            return WDR.Console.error(WDR, '[feeds/quests.js] The filter defined for ' + feed_channel[0] + ' does not appear to be a quest filter.');
        }

        if (feed_channel[1].roleid) {
            if (feed_channel[1].roleid == 'here' || feed_channel[1].roleid == 'everyone') {
                QUEST.role_id = '@' + feed_channel[1].roleid;
            } else {
                QUEST.role_id = '<@&' + feed_channel[1].roleid + '>';
            }
        }

        let defGeo = (channel.geofences.includes(QUEST.area.default));
        let mainGeo = (channel.geofences.includes(QUEST.area.main));
        let subGeo = (channel.geofences.includes(QUEST.area.sub));
        if (defGeo || mainGeo || subGeo) {

            let rewardPass = (channel.filter.Rewards.includes(QUEST.quest_reward) || channel.filter.Rewards.includes(QUEST.simple_reward));
            let typePass = (channel.filter.Rewards.includes(QUEST.reward_type));
            if (rewardPass || typePass) {

                let Embed_Config = require(WDR.Dir + '/configs/embeds/' + (feed_channel[1].embed ? feed_channel[1].embed : 'quests.js'));

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

                match.Embed = Embed_Config(WDR, match);

                WDR.Send_Embed(WDR, match.Embed, channel.id);
            }
        }
    }

    // END
    return;
};