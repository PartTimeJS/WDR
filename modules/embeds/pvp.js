

module.exports.run = async (MAIN, target, sighting, internal_value, time_now, area, server, timezone, role_id, embed, possible_cps) => {
  // RETURN IF NO CP PROVIDED
  if(sighting.cp == null){ return; }
  let Embed_Config = require('../../embeds/'+embed);

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.cache.get(server.id).members.get(target.user_id);

  // VARIABLES
  let typing = await MAIN.Get_Typing(MAIN, sighting);
  let pokemon = {};
  pokemon.encounter_id = sighting.encounter_id;
  // POKEMON NAME AND FORM
  pokemon.name = sighting.locale.pokemon_name;
  pokemon.form = sighting.locale.form;

  // GET SPRITE IMAGE
  pokemon.sprite = MAIN.Get_Sprite(MAIN, sighting);

  // IV INFO
  pokemon.iv = Math.round(internal_value);
  pokemon.cp = sighting.cp;
  pokemon.level = sighting.pokemon_level;
  pokemon.attack = sighting.individual_attack;
  pokemon.defense = sighting.individual_defense;
  pokemon.stamina = sighting.individual_stamina;

  // PVP INFO
  pokemon.possible_cps = possible_cps;
  pokemon.pvpString = '';
  pokemon.ranks = '';

  // DETERMINE HEIGHT, WEIGHT AND SIZE
  pokemon.height = Math.floor(sighting.height*100)/100;
  pokemon.weight = Math.floor(sighting.weight*100)/100;
  pokemon.size = sighting.size;

  // DETERMIND POKEMON TYPES AND WEAKNESSES
  pokemon.type = typing.type;
  pokemon.type_noemoji = typing.type_noemoji;
  pokemon.color = typing.color;
  pokemon.weather_boost = '';

  // DETERMINE MOVE NAMES AND TYPES
  pokemon.move_name_1 = sighting.locale.move_1;
  pokemon.move_type_1 = MAIN.emotes[MAIN.masterfile.moves[sighting.move_1].type.toLowerCase()];
  pokemon.move_name_2 = sighting.locale.move_2;
  pokemon.move_type_2 = MAIN.emotes[MAIN.masterfile.moves[sighting.move_2].type.toLowerCase()];

  // GET LOCATION INFO
  pokemon.lat = sighting.latitude;
  pokemon.lon = sighting.longitude;
  pokemon.area = area.embed;
  pokemon.map_url = MAIN.config.FRONTEND_URL;

  // STATIC MAP TILE
  pokemon.static_marker = [{
    "url" : MAIN.Get_Sprite(MAIN, sighting, 'STATIC_ASSETS'),
    "height" : 50,
    "width" : 50,
    "x_offset" : 0,
    "y_offset" : 0,
    "latitude" : sighting.latitude,
    "longitude" : sighting.longitude
  }];
  pokemon.static_map = MAIN.config.STATIC_MAP_URL+sighting.latitude+"/"+sighting.longitude+"/"+MAIN.config.STATIC_ZOOM+"/"+MAIN.config.STATIC_WIDTH+"/"+MAIN.config.STATIC_HEIGHT+"/2/png?markers="+encodeURIComponent(JSON.stringify(pokemon.static_marker));

  // MAP LINK PROVIDERS
  pokemon.google = '[Google]('+await MAIN.Short_URL(MAIN, 'https://www.google.com/maps?q='+sighting.latitude+','+sighting.longitude)+')';
  pokemon.apple = '[Apple]('+await MAIN.Short_URL(MAIN, 'http://maps.apple.com/maps?daddr='+sighting.latitude+','+sighting.longitude+'&z=10&t=s&dirflg=d')+')';
  pokemon.waze = '[Waze]('+await MAIN.Short_URL(MAIN, 'https://www.waze.com/ul?ll='+sighting.latitude+','+sighting.longitude+'&navigate=yes')+')';
  pokemon.pmsf = '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'?lat='+sighting.latitude+'&lon='+sighting.longitude+'&zoom=15')+')';

  // DESPAWN VERIFICATION
  pokemon.verified = sighting.disappear_time_verified ? MAIN.emotes.checkYes : MAIN.emotes.yellowQuestion;

  // DETERMINE DESPAWN TIME
  pokemon.time = MAIN.Bot_Time(sighting.disappear_time, '1', timezone);
  pokemon.mins = Math.floor((sighting.disappear_time-(time_now/1000))/60);
  pokemon.secs = Math.floor((sighting.disappear_time-(time_now/1000)) - (pokemon.mins*60));

  // GET GENDER
  switch(sighting.gender){
    case 1: pokemon.gender = ' '+MAIN.emotes.male; break;
    case 2: pokemon.gender = ' '+MAIN.emotes.female; break;
    default: pokemon.gender = '';
  }

  // GET WEATHER BOOST
  switch(sighting.weather){
    case 1: pokemon.weather_boost = ' | '+MAIN.emotes.clear+' ***Boosted***'; break;
    case 2: pokemon.weather_boost = ' | '+MAIN.emotes.rain+' ***Boosted***'; break;
    case 3: pokemon.weather_boost = ' | '+MAIN.emotes.partlyCloudy+' ***Boosted***'; break;
    case 4: pokemon.weather_boost = ' | '+MAIN.emotes.cloudy+' ***Boosted***'; break;
    case 5: pokemon.weather_boost = ' | '+MAIN.emotes.windy+' ***Boosted***'; break;
    case 6: pokemon.weather_boost = ' | '+MAIN.emotes.snow+' ***Boosted***'; break;
    case 7: pokemon.weather_boost = ' | '+MAIN.emotes.fog+' ***Boosted***'; break;
  }

  // FULL PVP STRING FOR RANKs, LEVEL AND PERCENT
  for(var pokemon_id in possible_cps){
    pokemon.pvpString += MAIN.masterfile.pokemon[pokemon_id].name+" Level "+possible_cps[pokemon_id].level+" CP "+possible_cps[pokemon_id].cp
                +" \n Rank: "+possible_cps[pokemon_id].rank+"("+possible_cps[pokemon_id].percent+"%)\n";
  } if(!pokemon.pvpString){ console.error('Problem with pvpString '+possible_cps);}

  // PVP RANK AND EVO STRING
  for(var id in possible_cps) {
    pokemon.ranks += ' | Rank '+possible_cps[id].rank+ ' ('+MAIN.masterfile.pokemon[id].name+')';
  } if(!pokemon.ranks){ console.error('Problem with Ranks '+possible_cps);}

  // CREATE AND SEND EMBED
  let pokemon_embed = Embed_Config(pokemon);
  if(MAIN.debug.PROCESSING_SPEED == 'ENABLED'){
    let difference = Math.round((new Date().getTime() - sighting.wdrReceived) / 10)/100;
    pokemon_embed.setFooter('Latency: '+difference+'s');
  }
  if(member){
    if (MAIN.config.TIME_REMAIN_SUBS && pokemon.mins < MAIN.config.TIME_REMAIN_SUBS) { return; }
    if(MAIN.debug.PVP == 'ENABLED' && MAIN.debug.Subscriptions == 'ENABLED'){ console.info('['+MAIN.Bot_Time(null,'stamp')+'] [EMBEDS] [pvp.js] Sent a '+pokemon.name+' to '+member.user.tag+' ('+member.id+').'); }
    return MAIN.Send_DM(MAIN, server.id, member.id, pokemon_embed, target.bot);
  } else if(MAIN.config.POKEMON.Discord_Feeds == 'ENABLED'){
    if(MAIN.config.TIME_REMAIN && pokemon.mins < MAIN.config.TIME_REMAIN) { return; }
    if(MAIN.debug.PVP == 'ENABLED' && MAIN.debug.Feed == 'ENABLED'){ console.info('['+MAIN.Bot_Time(null,'stamp')+'] [EMBEDS] [pvp.js] Sent a '+pokemon.name+' to '+target.guild.name+' ('+target.id+').'); }
    return MAIN.Send_Embed(MAIN, 'pokemon', 0, server, role_id, pokemon_embed, target.id);
  } else{ return; }
}
