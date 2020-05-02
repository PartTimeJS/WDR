

module.exports.run = async (MAIN, target, lure, type, area, server, timezone, role_id, embed) => {
  let Embed_Config = require('../../embeds/'+embed);
  let locale = await MAIN.Get_Data(MAIN, lure);

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.cache.get(server.id).members.cache.get(target.user_id);

  // VARIABLES
  let time_now = new Date().getTime();

  let pokestop = {};
  pokestop.type = locale.lure_type;
  pokestop.color = '';

  // DETERMINE STOP NAME
  pokestop.name = lure.name;
  pokestop.url = lure.url ? lure.url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png';

  // LURE EXPIRATION TIME
  pokestop.time = MAIN.Bot_Time(lure.lure_expiration, '1', timezone);
  pokestop.mins = Math.floor((lure.lure_expiration-(time_now/1000))/60);
  pokestop.secs = Math.floor((lure.lure_expiration-(time_now/1000)) - ((Math.floor((lure.lure_expiration-(time_now/1000))/60))*60));

  // GET LOCATION INFO
  pokestop.lat = lure.latitude;
  pokestop.lon = lure.longitude;
  pokestop.area = area.embed;
  pokestop.map_url = MAIN.config.FRONTEND_URL;

  // MAP LINK PROVIDERS
  pokestop.google = '[Google]('+await MAIN.Short_URL(MAIN, 'https://www.google.com/maps?q='+lure.latitude+','+lure.longitude)+')';
  pokestop.apple = '[Apple]('+await MAIN.Short_URL(MAIN, 'http://maps.apple.com/maps?daddr='+lure.latitude+','+lure.longitude+'&z=10&t=s&dirflg=d')+')';
  pokestop.waze = '[Waze]('+await MAIN.Short_URL(MAIN, 'https://www.waze.com/ul?ll='+lure.latitude+','+lure.longitude+'&navigate=yes')+')';
  pokestop.pmsf = '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'?lat='+lure.latitude+'&lon='+lure.longitude+'&zoom=15')+')';
  pokestop.rdm = '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'@/'+lure.latitude+'/'+lure.longitude+'/15')+')';

  // GET LURE TYPE, COLOR, AND SPRITE
  switch(type){
    case 'Normal':
      pokestop.color = 'ec78ea';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey.png';
    break;
    case 'Glacial':
      pokestop.color = '5feafd';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey_glacial.png';
    break;
    case 'Mossy':
      pokestop.color = '72ea38';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey_moss.png';
    break;
    case 'Magnetic':
      pokestop.color = 'fac036';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/00dd14bec9d3e17f89ddb021d71853c8b4667cf0/static_assets/png/TroyKey_magnetic.png'
    break;
    default:
      pokestop.color = '188ae2';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png';
    break;
  }

  // STATIC MAP TILE
  pokestop.static_marker = [{
    "url" : pokestop.sprite,
    "height" : 50,
    "width" : 50,
    "x_offset" : 0,
    "y_offset" : 0,
    "latitude" : lure.latitude,
    "longitude" : lure.longitude
  }];
  pokestop.static_map = MAIN.config.STATIC_MAP_URL+lure.latitude+"/"+lure.longitude+"/"+MAIN.config.STATIC_ZOOM+"/"+MAIN.config.STATIC_WIDTH+"/"+MAIN.config.STATIC_HEIGHT+"/2/png?markers="+encodeURIComponent(JSON.stringify(pokestop.static_marker));


  lure_embed = await Embed_Config(pokestop);
  if(member){
    if(MAIN.debug.Lure == 'ENABLED' && MAIN.debug.Subscriptions == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [lure.js] Sent a '+pokestop.name+' to '+member.user.tag+' ('+member.id+').'); }
    return MAIN.Send_DM(MAIN, server.id, member.id, lure_embed, target.bot);
  } else if(MAIN.config.LURE.Discord_Feeds == 'ENABLED'){
    if(pokestop.mins < MAIN.config.TIME_REMAIN){ return; }
    if(MAIN.debug.Lure == 'ENABLED' && MAIN.debug.Feed == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [lure.js] Sent a '+pokestop.name+' to '+target.guild.name+' ('+target.id+').'); }
    return MAIN.Send_Embed(MAIN, 'lure', 0, server, role_id, lure_embed, target.id);
  } else{ return; }

}
