const Create_Invasion_Embed = require(__dirname + '/../embeds/invasion.js');

module.exports = async (WDR, Invasion) => {

  // RETURN IF NO CHANNELS ARE SET
  if (!WDR.Invasion_Channels) {
    return;
  }

  // CHECK FOR GRUNT TYPE
  if (!WDR.Master.Grunt_Types[Invasion.grunt_type]) {
    return console.error("[subs/Invasion.js] [" + WDR.Time(null, 'stamp') + "] No Grunt found for " + Invasion.grunt_type + " in Grunts.json.");
  }

  // GET TYPE OF GRUNT
  Invasion.type = WDR.Master.Grunt_Types[Invasion.grunt_type].type;
  if (!Invasion.type) {
    return console.error("[subs/Invasion.js] [" + WDR.Time(null, 'stamp') + "] No Grunt type found for " + Invasion.grunt_type + " in Grunts.json.");
  }
  Invasion.gender = WDR.Master.Grunt_Types[Invasion.grunt_type].grunt;

  // CHECK ALL FILTERS
  for (let c = 0, ch_len = WDR.Invasion_Channels.length; c < ch_len; c++) {

    // ASSIGN CHANNEL TO VARIABLE
    let feed_channel = WDR.Invasion_Channels[c];

    // LOOK UP CHANNEL
    let Channel = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!Channel) {
      return console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [feeds/raids.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    // FETCH CHANNEL GEOFENCE
    Channel.Geofences = feed_channel[1].geofences.split(",");
    if (!Channel.Geofences) {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/raids.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    // FETCH CHANNEL FILTER
    Channel.Filter = WDR.Filters.get(feed_channel[1].filter);
    if (!Channel.Filter) {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/raids.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    // CHECK CHANNEL FILTER TYPE
    if (Channel.Filter.Type != "invasion") {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/raids.js] The filter defined for " + feed_channel[0] + " does not appear to be a invasion filter.");
    }

    // ADD ROLE ID IF IT EXISTS IN CHANNEL CONFIG
    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        Invasion.Role_ID = "@" + feed_channel[1].roleid;
      } else {
        Invasion.Role_ID = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    Invasion.Embed = feed_channel[1].embed ? feed_channel[1].embed : "invasion.js";

    switch (true) {
      case (Channel.Geofences.indexOf("ALL") >= 0):
      case (Channel.Geofences.indexOf(Invasion.Area.Default) >= 0):
      case (Channel.Geofences.indexOf(Invasion.Area.Main) >= 0):
      case (Channel.Geofences.indexOf(Invasion.Area.Sub) >= 0):

        // AREA FILTER
        switch (true) {
          case !Channel.Filter[Invasion.type]:
            break;
          case (Channel.Filter[Invasion.type].toLowerCase() == 'all'):
          case (Channel.Filter[Invasion.type].toLowerCase() == Invasion.gender.toLowerCase()):

            Create_Invasion_Embed(WDR, Channel, Invasion);
        }
    }
  }

  // END
  return;
}