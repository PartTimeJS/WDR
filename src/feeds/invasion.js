const Create_Invasion_Embed = require(__dirname + '/../embeds/invasion.js');

module.exports = async (WDR, INVASION) => {

  // RETURN IF NO CHANNELS ARE SET
  if (!WDR.Invasion_Channels) {
    return;
  }

  // CHECK FOR GRUNT TYPE
  if (!WDR.Master.Grunt_Types[INVASION.grunt_type]) {
    console.log(WDR.Master.Grunt_Types);
    return WDR.Console.error(WDR, "[feeds/invasion.js] No Grunt found for " + INVASION.grunt_type + " in Grunts.json.");
  }

  INVASION.gender = WDR.Master.Grunt_Types[INVASION.grunt_type].grunt;

  for (let c = 0, ch_len = WDR.Invasion_Channels.length; c < ch_len; c++) {

    let feed_channel = WDR.Invasion_Channels[c];

    let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!channel) {
      return WDR.Console.error(WDR, "[feeds/invasion.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    channel.Geofences = feed_channel[1].geofences.split(",");
    if (!channel.Geofences) {
      return WDR.Console.error(WDR, "[feeds/invasion.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    channel.Filter = WDR.Filters.get(feed_channel[1].filter);
    if (!channel.Filter) {
      return WDR.Console.error(WDR, "[feeds/invasion.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    if (channel.Filter.Type != "invasion") {
      return WDR.Console.error(WDR, "[feeds/invasion.js] The filter defined for " + feed_channel[0] + " does not appear to be a invasion filter.");
    }

    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        INVASION.role_id = "@" + feed_channel[1].roleid;
      } else {
        INVASION.role_id = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    INVASION.Embed = feed_channel[1].embed ? feed_channel[1].embed : "invasion.js";

    switch (true) {
      case (channel.Geofences.indexOf("ALL") >= 0):
      case (channel.Geofences.indexOf(INVASION.area.default) >= 0):
      case (channel.Geofences.indexOf(INVASION.area.main) >= 0):
      case (channel.Geofences.indexOf(INVASION.area.sub) >= 0):

        // AREA FILTER
        switch (true) {
          case !channel.Filter[INVASION.type]:
            break;
          case (channel.Filter[INVASION.type].toLowerCase() == 'all'):
          case (channel.Filter[INVASION.type].toLowerCase() == INVASION.gender.toLowerCase()):

            Create_Invasion_Embed(WDR, channel, INVASION);
        }
    }
  }

  // END
  return;
}