module.exports = async (WDR, LURE) => {

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

    LURE.embed = feed_channel[1].embed ? feed_channel[1].embed : "lure.js";

    switch (true) {
      case (channel.Geofences.indexOf(LURE.area.default) >= 0):
      case (channel.Geofences.indexOf(LURE.area.main) >= 0):
      case (channel.Geofences.indexOf(LURE.area.sub) >= 0):

        switch (true) {
          case (channel.Filter.Lure_Type.indexOf("ALL") >= 0):
          case (channel.Filter.Lure_Type.indexOf(LURE.type) >= 0):

            Create_Lure_Embed(WDR, channel.id, LURE);
        }
    }
  }

  // END
  return;
}


async function Create_Lure_Embed(WDR, channel_id, LURE) {
  let Embed_Config = require(WDR.Dir + "/configs/embeds/" + LURE.embed);

  let match = {};

  match.color = "";

  match.name = LURE.name;
  match.url = LURE.url ? LURE.url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png";

  match.time = WDR.Time(LURE.lure_expiration, "1", LURE.Timezone);
  match.mins = Math.floor((LURE.lure_expiration - (LURE.Time_Now / 1000)) / 60);
  match.secs = Math.floor((LURE.lure_expiration - (LURE.Time_Now / 1000)) - ((Math.floor((LURE.lure_expiration - (LURE.Time_Now / 1000)) / 60)) * 60));

  match.lat = LURE.latitude;
  match.lon = LURE.longitude;
  match.area = LURE.area.embed;
  match.map_url = WDR.Config.FRONTEND_URL;

  match.google = "[Google Maps](https://www.google.com/maps?q=" + match.lat + "," + match.lon + ")";
  match.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + match.lat + "," + match.lon + "&z=10&t=s&dirflg=d)";
  match.waze = "[Waze](https://www.waze.com/ul?ll=" + match.lat + "," + match.lon + "&navigate=yes)";
  match.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + match.lat + "&lon=" + match.lon + "&zoom=15)";
  match.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + match.lat + "/" + match.lon + "/15)";

  switch (LURE.type) {
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

  match.marker_latitude = match.lat + .0004;

  match.static_marker = [{
      "url": "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/other/pokestop_near.png",
      "height": 50,
      "width": 50,
      "x_offset": 0,
      "y_offset": 0,
      "latitude": match.marker_latitude,
      "longitude": match.lon
    },
    {
      "url": match.sprite,
      "height": 40,
      "width": 40,
      "x_offset": 0,
      "y_offset": -40,
      "latitude": match.marker_latitude,
      "longitude": match.lon
    }
  ];

  match.static_map = WDR.Config.STATIC_MAP_URL + "&latitude=" + match.marker_latitude + "&longitude=" + match.lon + "&zoom=" + WDR.Config.STATIC_ZOOM + "&width=" + WDR.Config.STATIC_WIDTH + "&height=" + WDR.Config.STATIC_HEIGHT + "&scale=2&markers=" + encodeURIComponent(JSON.stringify(match.static_marker));

  match.embed = await Embed_Config(WDR, match);

  return WDR.Send_Embed(WDR, match.embed, channel_id);
}