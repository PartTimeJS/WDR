const Create_Quest_Embed = require(__dirname + "/../embeds/quests.js");

module.exports = async (WDR, Quest) => {

  // CHECK ALL FILTERS
  for (let c = 0, ch_len = WDR.Quest_Channels.length; c < ch_len; c++) {
    let feed_channel = WDR.Quest_Channels[c];

    // LOOK UP CHANNEL
    let Channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!Channel) {
      return WDR.Console.error(WDR, "[feeds/raids.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    // FETCH CHANNEL GEOFENCE
    Channel.Geofences = feed_channel[1].geofences.split(",");
    if (!Channel.Geofences) {
      return WDR.Console.error(WDR, "[feeds/raids.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    // FETCH CHANNEL FILTER
    Channel.Filter = WDR.Filters.get(feed_channel[1].filter);
    if (!Channel.Filter) {
      return WDR.Console.error(WDR, "[feeds/raids.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    // CHECK CHANNEL FILTER TYPE
    if (Channel.Filter.Type != "quest") {
      return WDR.Console.error(WDR, "[feeds/raids.js] The filter defined for " + feed_channel[0] + " does not appear to be a quest filter.");
    }

    // ADD ROLE ID IF IT EXISTS IN CHANNEL CONFIG
    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        Raid.role_id = "@" + feed_channel[1].roleid;
      } else {
        Raid.role_id = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    // DEFINE MORE VARIABLES
    Quest.Embed = feed_channel[1].embed ? feed_channel[1].embed : "quests.js";

    switch (true) {
      case (Channel.Geofences.indexOf("ALL") >= 0):
      case (Channel.Geofences.indexOf(Quest.area.default) >= 0):
      case (Channel.Geofences.indexOf(Quest.area.main) >= 0):
      case (Channel.Geofences.indexOf(Quest.area.sub) >= 0):

        // REWARD FILTER
        switch (true) {
          case (Channel.Filter.Rewards.indexOf(Quest.quest_reward) >= 0):
          case (Channel.Filter.Rewards.indexOf(Quest.simple_reward) >= 0):
          case (Channel.Filter.Rewards.indexOf("ALL") >= 0):

            // PREPARE AND SEND TO DISCORDS
            return Create_Quest_Embed(WDR, Channel, Quest);
        }
    }
  }
}