const Create_Lure_Embed = require(__dirname + "/../embeds/lure.js");

module.exports = async (WDR, Lure) => {

  if (WDR.Lure_Channels.length < 1) {
    return;
  }

  switch (LURE.lure_id) {
    case 501:
      LURE.type = "Normal";
      break;
    case 502:
      LURE.type = "Glacial";
      break;
    case 503:
      LURE.type = "Mossy";
      break;
    case 504:
      LURE.type = "Magnetic";
      break;
    default:
      LURE.type = "Not Lured";
  }

  for (let c = 0, ch_len = WDR.Lure_Channels.length; c < ch_len; c++) {

    let feed_channel = WDR.Lure_Channels[c];

    let channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!channel) {
      return WDR.Console.error(WDR, "[feeds/lure.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }
    channel.Geofences = feed_channel[1].geofences.split(",");
    if (!channel.Geofences) {
      return WDR.Console.error(WDR, "[feeds/lure.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    channel.Filter = WDR.Filters.get(feed_channel[1].filter);
    if (!channel.Filter) {
      return WDR.Console.error(WDR, "[feeds/lure.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    if (channel.Filter.Type != "lure") {
      return WDR.Console.error(WDR, "[feeds/lure.js] The filter defined for " + feed_channel[0] + " does not appear to be a lure filter.");
    }

    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        LURE.role_id = "@" + feed_channel[1].roleid;
      } else {
        LURE.role_id = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    LURE.Embed = feed_channel[1].embed ? feed_channel[1].embed : "lure.js";

    switch (true) {
      case (channel.Geofences.indexOf("ALL") >= 0):
      case (channel.Geofences.indexOf(LURE.area.default) >= 0):
      case (channel.Geofences.indexOf(LURE.area.main) >= 0):
      case (channel.Geofences.indexOf(LURE.area.sub) >= 0):

        switch (true) {
          case (channel.Filter.Lure_Type.indexOf("ALL") >= 0):
          case (channel.Filter.Lure_Type.indexOf(LURE.type) >= 0):

            Create_Lure_Embed(WDR, channel, LURE);
        }
    }
  }

  // END
  return;
}