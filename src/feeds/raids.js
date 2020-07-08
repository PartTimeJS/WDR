const Create_Raid_Embed = require(__dirname + "/../embeds/raids.js");

module.exports = async (WDR, Raid) => {

  if (WDR.Raid_Channels.length < 1) {
    return;
  }

  // FILTER FEED TYPE FOR EGG, BOSS, OR BOTH
  if (Raid.cp > 0 || Raid.is_exclusive == true) {
    Raid.Type = "Boss";
  } else {
    Raid.Type = "Egg";
  }

  if (WDR.Debug.Raids == "ENABLED" && WDR.Debug.Feed == "ENABLED") {
    console.log("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/raids.js] Received a " + Raid.pokemon_name + " Raid.");
  }

  // CHECK ALL FILTERS
  for (let c = 0, ch_len = WDR.Raid_Channels.length; c < ch_len; c++) {
    let feed_channel = WDR.Raid_Channels[c];

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
    if (Channel.Filter.Type != "raid") {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/raids.js] The filter defined for " + feed_channel[0] + " does not appear to be a raid filter.");
    }

    // ADD ROLE ID IF IT EXISTS IN CHANNEL CONFIG
    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        Raid.Role_ID = "@" + feed_channel[1].roleid;
      } else {
        Raid.Role_ID = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    // IDENTIFY THE EMBED TYPE
    if (Raid.Type == "Egg") {
      switch (true) {
        case !feed_channel[1].embed:
          Raid.Embed = "raid_eggs.js";
          break;
        case !feed_channel[1].embed_egg:
          Raid.Embed = "raid_eggs.js";
          break;
        default:
          Raid.Embed = feed_channel[1].embed_egg;
      }
    } else {
      Raid.Embed = feed_channel[1].embed ? feed_channel[1].embed : "raids.js";
    }

    // MATCH TO GEOFENCES
    switch (true) {
      case Channel.Geofences.indexOf("ALL") >= 0:
        Raid.Matched_Geofence = true;
        break;
      case Channel.Geofences.indexOf(Raid.Area.Default) >= 0:
        Raid.Matched_Geofence = true;
        break;
      case (Channel.Geofences.indexOf(Raid.Area.Main) >= 0):
        Raid.Matched_Geofence = true;
        break;
      case (Channel.Geofences.indexOf(Raid.Area.Sub) >= 0):
        Raid.Matched_Geofence = true;
        break;
      default:
        Raid.Matched_Geofence = false;
    }

    // MATCH EGG FILTERS
    Raid.Matched_Egg = (Raid.Type == "Egg" && (Channel.Filter.Egg_Levels.indexOf(Raid.level) >= 0));

    // MATCH BOSS FILTERS
    Raid.Matched_Boss = (Raid.Type == "Boss" && (Channel.Filter.Boss_Levels.indexOf(Raid.level) >= 0 || Channel.Filter.Boss_Levels.indexOf(Raid.pokemon_name) >= 0));

    // MATCH EX ELIGIBILITY FILTER
    switch (true) {
      case (Channel.Filter.Ex_Eligible_Only == undefined || Channel.Filter.Ex_Eligible_Only != true):
        Raid.Matched_Ex_Eligibility = true;
        break;
      case (Channel.Filter.Ex_Eligible_Only == Raid.ex_raid_eligible || Channel.Filter.Ex_Eligible_Only == Raid.sponsor_id):
        Raid.Matched_Ex_Eligibility = true;
        break;
      default:
        Raid.Matched_Ex_Eligibility = false;
    }

    if (Raid.Matched_Geofence) {
      if (Raid.Matched_Egg || Raid.Matched_Boss) {
        if (Raid.Matched_Ex_Eligibility) {

          // INSERT RAID LOBBY AND SEND RAID
          Create_Raid_Embed(WDR, Channel, Raid);
        }
      }
    }
  }
  // END
  return;
}