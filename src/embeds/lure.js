module.exports = async (WDR, Target, Lure) => {
  let Embed_Config = require(WDR.Dir + "/configs/embeds/" + Lure.Embed);

  // CHECK IF THE TARGET IS A USER
  Lure.Member = WDR.Bot.guilds.cache.get(Lure.Discord.id).members.cache.get(Target.user_id);

  Lure.color = "";

  // DETERMINE STOP NAME
  Lure.name = Lure.name;
  Lure.url = Lure.url ? Lure.url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png";

  // LURE EXPIRATION TIME
  Lure.time = WDR.Time(Lure.lure_expiration, "1", Lure.Timezone);
  Lure.mins = Math.floor((Lure.lure_expiration - (Lure.Time_Now / 1000)) / 60);
  Lure.secs = Math.floor((Lure.lure_expiration - (Lure.Time_Now / 1000)) - ((Math.floor((Lure.lure_expiration - (Lure.Time_Now / 1000)) / 60)) * 60));

  // GET LOCATION INFO
  Lure.lat = Lure.latitude;
  Lure.lon = Lure.longitude;
  Lure.area = Lure.area.embed;
  Lure.map_url = WDR.Config.FRONTEND_URL;

  // MAP LINK PROVIDERS
  Lure.google = "[Google Maps](https://www.google.com/maps?q=" + Lure.latitude + "," + Lure.longitude + ")";
  Lure.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + Lure.latitude + "," + Lure.longitude + "&z=10&t=s&dirflg=d)";
  Lure.waze = "[Waze](https://www.waze.com/ul?ll=" + Lure.latitude + "," + Lure.longitude + "&navigate=yes)";
  Lure.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + Lure.latitude + "&lon=" + Lure.longitude + "&zoom=15)";
  Lure.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + Lure.latitude + "/" + Lure.longitude + "/15)";

  // GET LURE TYPE, COLOR, AND SPRITE
  switch (Lure.type) {
    case "Normal":
      Lure.color = "ec78ea";
      Lure.sprite = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey.png";
      break;
    case "Glacial":
      Lure.color = "5feafd";
      Lure.sprite = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey_glacial.png";
      break;
    case "Mossy":
      Lure.color = "72ea38";
      Lure.sprite = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey_moss.png";
      break;
    case "Magnetic":
      Lure.color = "fac036";
      Lure.sprite = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/00dd14bec9d3e17f89ddb021d71853c8b4667cf0/static_assets/png/TroyKey_magnetic.png"
      break;
    default:
      Lure.color = "188ae2";
      Lure.sprite = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png";
      break;
  }

  Lure.marker_latitude = Lure.latitude + .0004;

  // STATIC MAP TILE
  Lure.static_marker = [{
      "url": "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/other/pokestop_near.png",
      "height": 50,
      "width": 50,
      "x_offset": 0,
      "y_offset": 0,
      "latitude": Lure.marker_latitude,
      "longitude": Lure.longitude
    },
    {
      "url": Lure.sprite,
      "height": 40,
      "width": 40,
      "x_offset": 0,
      "y_offset": -40,
      "latitude": Lure.marker_latitude,
      "longitude": Lure.longitude
    }
  ];

  Lure.static_map = WDR.Config.STATIC_MAP_URL + "&latitude=" + Lure.marker_latitude + "&longitude=" + Lure.longitude + "&zoom=" + WDR.Config.STATIC_ZOOM + "&width=" + WDR.Config.STATIC_WIDTH + "&height=" + WDR.Config.STATIC_HEIGHT + "&scale=2&markers=" + encodeURIComponent(JSON.stringify(Lure.static_marker));

  Lure.Embed = await Embed_Config(WDR, Lure);

  if (Lure.Member) {
    if (WDR.Debug.Lure == "ENABLED" && WDR.Debug.Subscriptions == "ENABLED") {
      WDR.Console.log(WDR,"[EMBEDS] [" + WDR.Time(null, "stamp") + "] [Lure.js] Sent a " + Lure.name + " to " + Lure.Member.user.tag + " (" + Lure.Member.id + ").");
    }
    return WDR.Send_DM(WDR, Lure.Discord.id, Lure.Member.id, Lure.Embed, Target.bot);
  } else {
    // if (Lure.mins < WDR.Config.TIME_REWDR) {
    //   return;
    // }

    return WDR.Send_Embed(WDR, Lure.Embed, Target.id);
  }
}