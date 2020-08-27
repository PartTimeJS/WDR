const Create_Quest_Embed = require(__dirname + "/../embeds/quests.js");

module.exports = async (WDR, Quest) => {

  // CHECK ALL FILTERS
  for (let c = 0, ch_len = WDR.Quest_Channels.length; c < ch_len; c++) {
    let feed_channel = WDR.Quest_Channels[c];

    // LOOK UP CHANNEL
    let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!channel) {
      return WDR.Console.error(WDR, "[feeds/quests.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    // FETCH CHANNEL GEOFENCE
    channel.geofences = feed_channel[1].geofences.split(",");
    if (!channel.geofences) {
      return WDR.Console.error(WDR, "[feeds/quests.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    // FETCH CHANNEL FILTER
    channel.Filter = WDR.Filters.get(feed_channel[1].filter);
    if (!channel.Filter) {
      return WDR.Console.error(WDR, "[feeds/quests.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    // CHECK CHANNEL FILTER TYPE
    if (channel.Filter.Type != "quest") {
      return WDR.Console.error(WDR, "[feeds/quests.js] The filter defined for " + feed_channel[0] + " does not appear to be a quest filter.");
    }

    // ADD ROLE ID IF IT EXISTS IN CHANNEL CONFIG
    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        Quest.role_id = "@" + feed_channel[1].roleid;
      } else {
        Quest.role_id = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    // DEFINE MORE VARIABLES
    Quest.Embed = feed_channel[1].embed ? feed_channel[1].embed : "quests.js";

    let defGeo = (channel.geofences.indexOf(Quest.area.default) >= 0);
    let mainGeo = (channel.geofences.indexOf(Quest.area.main) >= 0);
    let subGeo = (channel.geofences.indexOf(Quest.area.sub) >= 0);

    if (defGeo || mainGeo || subGeo) {

      let rewardPass = (channel.Filter.Rewards.indexOf(Quest.quest_reward) >= 0 || channel.Filter.Rewards.indexOf(Quest.simple_reward) >= 0);
      let typePass = (channel.Filter.Rewards.indexOf(Quest.reward_type) >= 0);

      if (rewardPass || typePass) {

        let Embed_Config = require(WDR.Dir + "/configs/embeds/" + Quest.Embed);

        // VARIABLES
        Quest.name = Quest.pokestop_name;
        Quest.reward = Quest.quest_reward;
        Quest.form = Quest.form_name;

        // GET LOCATION INFO
        Quest.lat = Quest.latitude;
        Quest.lon = Quest.longitude;
        Quest.area = Quest.area.embed;
        Quest.url = Quest.pokestop_url;
        Quest.map_url = WDR.Config.FRONTEND_URL;

        // MAP LINK PROVIDERS
        Quest.google = "[Google Maps](https://www.google.com/maps?q=" + Quest.latitude + "," + Quest.longitude + ")";
        Quest.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + Quest.latitude + "," + Quest.longitude + "&z=10&t=s&dirflg=d)";
        Quest.waze = "[Waze](https://www.waze.com/ul?ll=" + Quest.latitude + "," + Quest.longitude + "&navigate=yes)";
        Quest.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + Quest.latitude + "&lon=" + Quest.longitude + "&zoom=15)";
        Quest.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + Quest.latitude + "/" + Quest.longitude + "/15)";

        Quest.reward_sprite = WDR.Get_Sprite(WDR, Quest);

        Quest.marker_latitude = Quest.latitude + .0004;

        Quest.body = await WDR.Generate_Tile(WDR, Quest, "quests", Quest.marker_latitude, Quest.lon, Quest.reward_sprite);
        Quest.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + Quest.body;

        // DECLARE VARIABLES
        Quest.time = WDR.Time(null, "quest", Quest.Timezone);

        // GET EMBED COLOR BASED ON QUEST DIFFICULTY
        switch (true) {
          case Quest.template.indexOf("easy") >= 0:
            Quest.color = "00ff00";
            break;
          case Quest.template.indexOf("moderate") >= 0:
            Quest.color = "ffff00";
            break;
          case Quest.template.indexOf("hard") >= 0:
            Quest.color = "ff0000";
            break;
          default:
            Quest.color = "00ccff";
        }

        // CREATE QUEST EMBED
        if (!Quest.sprite) {
          Quest.sprite = Quest.url;
        }

        Quest.Embed = Embed_Config(WDR, Quest);

        // SEND EMBED TO CHANNEL
        return WDR.Send_Embed(WDR, Quest.Embed, channel.id);
      }
    }
  }
}