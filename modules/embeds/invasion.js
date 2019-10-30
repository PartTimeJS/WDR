const Discord = require('discord.js');

module.exports.run = async (MAIN, target, invasion, type, main_area, sub_area, embed_area, server, timezone, role_id, embed) => {
  let Embed_Config = require('../../embeds/'+embed);
  let invasion_embed = {};

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.get(server.id).members.get(target.user_id);

  // VARIABLES
  let time_now = new Date().getTime();
  let pokestop = {
    name: invasion.name,
    url: invasion.url ? invasion.url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/Badge_Pokestop_SILVER_01.png',

    // DETERMIND INVASION TYPES AND WEAKNESSES
    grunt_type: type, weaknesses: '', resistances: '',
    type: MAIN.emotes[type.toLowerCase()] ? MAIN.emotes[type.toLowerCase()] : '',
    color: MAIN.Type_Color(MAIN, type),

    // MALE OR FEMALE GRUNT?
    grunt_gender: MAIN.grunts[invasion.grunt_type].grunt,

    //INCIDENT EXPIRATION TIMES
    time: await MAIN.Bot_Time(invasion.incident_expire_timestamp, '1', timezone),
    mins: Math.floor((invasion.incident_expire_timestamp-(time_now/1000))/60),
    secs: Math.floor((invasion.incident_expire_timestamp-(time_now/1000)) - ((Math.floor((invasion.incident_expire_timestamp-(time_now/1000))/60))*60)),

    lat: invasion.latitude, lon: invasion.longitude,
    area: embed_area,
    map_url: MAIN.config.FRONTEND_URL,

    // MAP LINK PROVIDERS
    google: '[Google]('+await MAIN.Short_URL(MAIN, 'https://www.google.com/maps?q='+invasion.latitude+','+invasion.longitude)+')',
    apple: '[Apple]('+await MAIN.Short_URL(MAIN, 'http://maps.apple.com/maps?daddr='+invasion.latitude+','+invasion.longitude+'&z=10&t=s&dirflg=d')+')',
    waze: '[Waze]('+await MAIN.Short_URL(MAIN, 'https://www.waze.com/ul?ll='+invasion.latitude+','+invasion.longitude+'&navigate=yes')+')',
    pmsf: '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'?lat='+invasion.latitude+'&lon='+invasion.longitude+'&zoom=15')+')',
    rdm: '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'@/'+invasion.latitude+'/'+invasion.longitude+'/15')+')',

    // GET STATIC MAP TILE
    map_img: await MAIN.Static_Map_Tile(MAIN, invasion.latitude, invasion.longitude, 'quest'),

    // OTHER VARIABLES
    encounters: 'Unknown', battles: 'Unknown',
    first: '', second: '', third: ''
  };

  // WEAKNESSES FOR INVASION TYPES
  if(type == 'Tier II' && MAIN.grunts[invasion.grunt_type].encounters){type = MAIN.masterfile.pokemon[parseInt(MAIN.grunts[invasion.grunt_type].encounters.first[0].split('_')[0])].types[0]}
  if(type != 'Tier II'){
    MAIN.types[type].resistances.forEach((resistance,index) => {
      MAIN.types[type].weaknesses.forEach((weakness,index) => {
        if(pokestop.weaknesses.indexOf(MAIN.emotes[weakness.toLowerCase()]) < 0){
          pokestop.weaknesses += MAIN.emotes[weakness.toLowerCase()]+' ';
        }
        if(pokestop.resistances.indexOf(MAIN.emotes[resistance.toLowerCase()]) < 0){
          pokestop.resistances += MAIN.emotes[resistance.toLowerCase()]+' ';
        }
      });
    });
  }
  if(!pokestop.resistances || pokestop.resistances.trim() == 'undefined'){ pokestop.resistances = 'None'; }
  if(!pokestop.weaknesses || pokestop.weaknesses.trim() == 'undefined'){ pokestop.weaknesses = 'None'; }

  // Generate A Sprite Image for Embed
  switch (pokestop.grunt_gender) {
    case 'Male':
      pokestop.sprite = 'https://cdn.discordapp.com/attachments/487387866394263552/605492063768936451/male_grunt_face_pink.png';
      pokestop.gender = ' '+MAIN.emotes.male; break;
    case 'Female':
      pokestop.sprite = 'https://cdn.discordapp.com/attachments/487387866394263552/605492065643659315/female_grunt_face_pink.png';
      pokestop.gender = ' '+MAIN.emotes.female; break;
    default:
      pokestop.sprite = 'https://i.imgur.com/aAS6VUM.png';
      pokestop.gender = '';
  }

  // POSSIBLE ENCOUNTERS
  if(MAIN.grunts[invasion.grunt_type].encounters){
    let name = '', pokemon_id = '';
    MAIN.grunts[invasion.grunt_type].encounters.first.forEach((id) => {
      pokemon_id = parseInt(id.split('_')[0]);
      if(MAIN.emotes[MAIN.masterfile.pokemon[pokemon_id].name] != undefined){
        name = MAIN.emotes[MAIN.masterfile.pokemon[pokemon_id].name]
      } else { name = MAIN.masterfile.pokemon[pokemon_id].name }
      pokestop.first += name+' ';
    });
    MAIN.grunts[invasion.grunt_type].encounters.second.forEach((id) => {
      pokemon_id = parseInt(id.split('_')[0]);
      if(MAIN.emotes[MAIN.masterfile.pokemon[pokemon_id].name] != undefined){
        name = MAIN.emotes[MAIN.masterfile.pokemon[pokemon_id].name]
      } else { name = MAIN.masterfile.pokemon[pokemon_id].name }
      if(pokestop.first.indexOf(name) < 0 && pokestop.first.indexOf(MAIN.emotes[MAIN.masterfile.pokemon[pokemon_id].name]) < 0){
        pokestop.second += name+' ';
      }
    });
    MAIN.grunts[invasion.grunt_type].encounters.third.forEach((id) => {
      pokemon_id = parseInt(id.split('_')[0]);
      if(MAIN.emotes[MAIN.masterfile.pokemon[pokemon_id].name] != undefined){
        name = MAIN.emotes[MAIN.masterfile.pokemon[pokemon_id].name]
      } else { name = MAIN.masterfile.pokemon[pokemon_id].name }
      if(pokestop.first.indexOf(name) < 0 && pokestop.second.indexOf(name) < 0 && pokestop.first.indexOf(MAIN.emotes[MAIN.masterfile.pokemon[pokemon_id].name]) < 0 && pokestop.second.indexOf(MAIN.emotes[MAIN.masterfile.pokemon[pokemon_id].name]) < 0){
        pokestop.third += name+' ';
      }

    });
  }
  if(MAIN.grunts[invasion.grunt_type].second_reward && MAIN.grunts[invasion.grunt_type].second_reward == 'true'){
    pokestop.encounters = '';
    pokestop.encounters += '**85% Chance to Encounter**:\n '+pokestop.first+'\n';
    pokestop.encounters += '**15% Chance to Encounter**:\n '+pokestop.second+'\n';
  } else if(MAIN.grunts[invasion.grunt_type].encounters){
    pokestop.encounters = '';
    pokestop.encounters += '**100% Chance to Encounter**:\n '+pokestop.first+'\n';
    if(pokestop.first.length <= 25){
      pokestop.sprite = await MAIN.Get_Sprite(MAIN, { pokemon_id: parseInt(MAIN.grunts[invasion.grunt_type].encounters.first[0].split('_')[0]), form: parseInt(MAIN.grunts[invasion.grunt_type].encounters.first[0].split('_')[1]) });
    }
  } //if(!MAIN.grunts[invasion.grunt_type].encounters){ console.info('[Embeds] ['+MAIN.Bot_Time(null,'stamp')+'] [invasion.js] No encounter info for: '+invasion.grunt_type);}

  invasion_embed = await Embed_Config(pokestop);
  if(member){
    if(MAIN.debug.Invasion == 'ENABLED' && MAIN.debug.Subscriptions == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [invasion.js] Sent a '+pokestop.name+' to '+member.user.tag+' ('+member.id+').'); }
    return MAIN.Send_DM(MAIN, server.id, member.id, invasion_embed, target.bot);
  } else if(MAIN.config.INVASION.Discord_Feeds == 'ENABLED'){
    if(pokestop.mins < MAIN.config.TIME_REMAIN){ return; }
    if(MAIN.debug.Invasion == 'ENABLED' && MAIN.debug.Feed == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [invasion.js] Sent a '+pokestop.name+' to '+target.guild.name+' ('+target.id+').'); }
    return MAIN.Send_Embed(MAIN, 'invasion', 0, server, role_id, invasion_embed, target.id);
  } else{ return; }
}
