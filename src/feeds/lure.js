const Create_Lure_Embed = require(__dirname + "/../embeds/lure.js");

module.exports = async (WDR, Lure) => {

  if (WDR.Lure_Channels.length < 1) {
    return;
  }

  switch (Lure.lure_id) {
    case 501:
      Lure.type = "Normal";
      break;
    case 502:
      Lure.type = "Glacial";
      break;
    case 503:
      Lure.type = "Mossy";
      break;
    case 504:
      Lure.type = "Magnetic";
      break;
    default:
      Lure.type = "Not Lured";
  }

  // CHECK ALL FILTERS
  for (let c = 0, ch_len = WDR.Lure_Channels.length; c < ch_len; c++) {

    // ASSIGN CHANNEL TO VARIABLE
    let feed_channel = WDR.Lure_Channels[c];

    // LOOK UP CHANNEL
    let Channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!Channel) {
      return console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [feeds/lure.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    // FETCH CHANNEL GEOFENCE
    Channel.Geofences = feed_channel[1].geofences.split(",");
    if (!Channel.Geofences) {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/lure.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    // FETCH CHANNEL FILTER
    Channel.Filter = WDR.Filters.get(feed_channel[1].filter);
    if (!Channel.Filter) {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/lure.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    // CHECK CHANNEL FILTER TYPE
    if (Channel.Filter.Type != "lure") {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/lure.js] The filter defined for " + feed_channel[0] + " does not appear to be a lure filter.");
    }

    // ADD ROLE ID IF IT EXISTS IN CHANNEL CONFIG
    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        Lure.Role_ID = "@" + feed_channel[1].roleid;
      } else {
        Lure.Role_ID = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    // IF CHANNEL SPECIFIC LURE EMBED SPECIFIED USE IT
    Lure.Embed = feed_channel[1].embed ? feed_channel[1].embed : "lure.js";

    switch (true) {
      case (Channel.Geofences.indexOf("ALL") >= 0):
      case (Channel.Geofences.indexOf(Lure.Area.Default) >= 0):
      case (Channel.Geofences.indexOf(Lure.Area.Main) >= 0):
      case (Channel.Geofences.indexOf(Lure.Area.Sub) >= 0):

        switch (true) {
          case (Channel.Filter.Lure_Type.indexOf("ALL") >= 0):
          case (Channel.Filter.Lure_Type.indexOf(Lure.type) >= 0):

            Create_Lure_Embed(WDR, Channel, Lure);
        }

    }
  }

  // END
  return;
}