const Discord = require('discord.js');

module.exports.run = async (MAIN, target, lure, type, main_area, sub_area, embed_area, server, timezone, role_id, embed) => {
  let Embed_Config = require('../../embeds/'+embed);
  let locale = await MAIN.Get_Locale(MAIN, lure, server);

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.get(server.id).members.get(target.user_id);

  // VARIABLES
  let time_now = new Date().getTime();
  let pokestop = {
    type: locale.lure_type, color: '',
    // DETERMINE STOP NAME
    name: lure.name,
    url: lure.url ? lure.url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png',

    // LURE EXPIRATION TIME
    time: await MAIN.Bot_Time(lure.lure_expiration, '1', timezone),
    mins: Math.floor((lure.lure_expiration-(time_now/1000))/60),
    secs: Math.floor((lure.lure_expiration-(time_now/1000)) - ((Math.floor((lure.lure_expiration-(time_now/1000))/60))*60)),

    // GET LOCATION INFO
    lat: lure.latitude, lon: lure.longitude,
    area: embed_area,
    map_url: MAIN.config.FRONTEND_URL,

    // MAP LINK PROVIDERS
    google: '[Google]('+await MAIN.Short_URL(MAIN, 'https://www.google.com/maps?q='+lure.latitude+','+lure.longitude)+')',
    apple: '[Apple]('+await MAIN.Short_URL(MAIN, 'http://maps.apple.com/maps?daddr='+lure.latitude+','+lure.longitude+'&z=10&t=s&dirflg=d')+')',
    waze: '[Waze]('+await MAIN.Short_URL(MAIN, 'https://www.waze.com/ul?ll='+lure.latitude+','+lure.longitude+'&navigate=yes')+')',
    pmsf: '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'?lat='+lure.latitude+'&lon='+lure.longitude+'&zoom=15')+')',
    rdm: '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'@/'+lure.latitude+'/'+lure.longitude+'/15')+')',

    // GET STATIC MAP TILE
    map_img: await MAIN.Static_Map_Tile(MAIN, lure.latitude, lure.longitude, 'quest')
  };

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
