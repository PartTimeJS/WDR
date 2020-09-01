module.exports = async (WDR, LURE) => {

  console.log("1", LURE.name);

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

    switch (true) {
      case (channel.Geofences.indexOf(LURE.area.default) >= 0):
      case (channel.Geofences.indexOf(LURE.area.main) >= 0):
      case (channel.Geofences.indexOf(LURE.area.sub) >= 0):

        switch (true) {
          case (channel.Filter.Lure_Type.indexOf("ALL") >= 0):
          case (channel.Filter.Lure_Type.indexOf(LURE.type) >= 0):

            let Embed_Config = require(WDR.Dir + "/configs/embeds/" + (feed_channel[1].embed ? feed_channel[1].embed : "lure.js"));

            let match = {};

            match.color = "";

            match.type = LURE.type;

            match.name = LURE.name;
            match.url = LURE.url ? LURE.url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png";

            match.time = WDR.Time(LURE.lure_expiration, "1", LURE.Timezone);
            match.mins = Math.floor((LURE.lure_expiration - (LURE.Time_Now / 1000)) / 60);
            match.secs = Math.floor((LURE.lure_expiration - (LURE.Time_Now / 1000)) - ((Math.floor((LURE.lure_expiration - (LURE.Time_Now / 1000)) / 60)) * 60));

            match.marker_latitude = LURE.latitude + .0004;

            match.lat = LURE.latitude;
            match.lon = LURE.longitude;
            match.area = LURE.area.embed;
            match.map_url = WDR.Config.FRONTEND_URL;

            match.google = "[Google Maps](https://www.google.com/maps?q=" + match.lat + "," + match.lon + ")";
            match.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + match.lat + "," + match.lon + "&z=10&t=s&dirflg=d)";
            match.waze = "[Waze](https://www.waze.com/ul?ll=" + match.lat + "," + match.lon + "&navigate=yes)";
            match.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + match.lat + "&lon=" + match.lon + "&zoom=15)";
            match.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + match.lat + "/" + match.lon + "/15)";

            switch (match.type) {
              case "Normal":
                match.color = "ec78ea";
                match.sprite = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey.png";
                break;
              case "Glacial":
                match.color = "5feafd";
                match.sprite = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey_glacial.png";
                break;
              case "Mossy":
                match.color = "72ea38";
                match.sprite = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey_moss.png";
                break;
              case "Magnetic":
                match.color = "fac036";
                match.sprite = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/00dd14bec9d3e17f89ddb021d71853c8b4667cf0/static_assets/png/TroyKey_magnetic.png"
                break;
              default:
                match.color = "188ae2";
                match.sprite = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png";
                break;
            }
            if (match.mins >= 5) {

              if (WDR.Config.LURE_PREGEN_TILES != "DISABLED") {
                if (LURE.static_map) {
                  match.static_map = LURE.static_map;
                } else {
                  match.body = await WDR.Generate_Tile(WDR, LURE, "lures", match.marker_latitude, match.lon, match.sprite);
                  LURE.body = match.body;
                  match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;
                  LURE.static_map = match.static_map;
                }
              }

              console.log("2", match.name);

              match.embed = Embed_Config(WDR, match);

              WDR.Send_Embed(WDR, match.embed, channel.id);
            }
        }
    }
  }

  // END
  return;
}