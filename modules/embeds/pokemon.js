

module.exports.run = async (MAIN, has_iv, target, sighting, internal_value, time_now, area, server, timezone, content, embed) => {
  let Embed_Config = require('../../embeds/'+embed);
  let pokemon_embed = '';

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.cache.get(server.id).members.cache.get(target.user_id);

  // VARIABLES POKEMON NAME, FORM AND TYPE EMOTES
  let typing = await MAIN.Get_Typing(MAIN, sighting);

  // POKEMON OBJECT
  let pokemon = {};
  pokemon.name = sighting.locale.pokemon_name;
  pokemon.pokemon_id = sighting.pokemon_id;
  pokemon.form = sighting.locale.form;
  pokemon.gender = ' ';
  pokemon.sprite = MAIN.Get_Sprite(MAIN, sighting);
  pokemon.iv = Math.round(internal_value);
  pokemon.type = typing.type;
  pokemon.type_noemoji = typing.type_noemoji;
  pokemon.color = typing.color;
  pokemon.weather_boost = ' | ';
  pokemon.lat = sighting.latitude;
  pokemon.lon = sighting.longitude;
  pokemon.area = area.embed;
  pokemon.map_url = MAIN.config.FRONTEND_URL;

  // LINK VARIABLES
  pokemon.google = '[Google](https://www.google.com/maps?q='+sighting.latitude+','+sighting.longitude+')';
  pokemon.apple = '[Apple](http://maps.apple.com/maps?daddr='+sighting.latitude+','+sighting.longitude+'&z=10&t=s&dirflg=d)';
  pokemon.waze = '[Waze](https://www.waze.com/ul?ll='+sighting.latitude+','+sighting.longitude+'&navigate=yes)';
  pokemon.pmsf = '[Scan Map]('+MAIN.config.FRONTEND_URL+'?lat='+sighting.latitude+'&lon='+sighting.longitude+'&zoom=15)';
  pokemon.rdm = '[Scan Map]('+MAIN.config.FRONTEND_URL+'@/'+sighting.latitude+'/'+sighting.longitude+'/15)';

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

  //LOG TILE IF enabled
  if(MAIN.debug.Map_Tiles == "ENABLED"){
    console.info(pokemon.static_map);
  }

  // TIME VARIABLES
  pokemon.verified = sighting.disappear_time_verified ? MAIN.emotes.checkYes : MAIN.emotes.yellowQuestion;
  pokemon.time = MAIN.Bot_Time(sighting.disappear_time, '1', timezone);
  pokemon.mins = Math.floor((sighting.disappear_time-(time_now/1000))/60);
  pokemon.secs = Math.floor((sighting.disappear_time-(time_now/1000)) - (pokemon.mins*60));

  // IDENTIFY DITTO AND ALTER DISPLAY NAME
  if(sighting.pokemon_id == 132){
    let old = await MAIN.Get_Data(MAIN, {pokemon_id: sighting.display_pokemon_id});
    pokemon.name += ' ('+old.pokemon_name+')';
  }

  // GET GENDER
  switch(sighting.gender){
    case 1: pokemon.gender += MAIN.emotes.male; break;
    case 2: pokemon.gender += MAIN.emotes.female; break;
    default: pokemon.gender = '';
  }

  // GET WEATHER BOOST
  switch(sighting.weather){
    case 1: pokemon.weather_boost += MAIN.emotes.clear; break;
    case 2: pokemon.weather_boost += MAIN.emotes.rain; break;
    case 3: pokemon.weather_boost += MAIN.emotes.partlyCloudy; break;
    case 4: pokemon.weather_boost += MAIN.emotes.cloudy; break;
    case 5: pokemon.weather_boost += MAIN.emotes.windy; break;
    case 6: pokemon.weather_boost += MAIN.emotes.snow; break;
    case 7: pokemon.weather_boost += MAIN.emotes.fog; break;
    default: pokemon.weather_boost = '';
  } if(pokemon.weather_boost){ pokemon.weather_boost += ' ***Boosted***'; }

  // CHECK IF TARGET IS A MEMBER OR A CHANNEL
  if(has_iv == false || (sighting.cp == null && MAIN.config.POKEMON.sub_without_iv == 'ENABLED')) {
    pokemon_embed = Embed_Config(pokemon);

    // CHECK IF TARGET IS A MEMBER OR A CHANNEL
    if(member){
      if (MAIN.config.TIME_REMAIN_SUBS && pokemon.mins < MAIN.config.TIME_REMAIN_SUBS) { return; }
      if(MAIN.config.VERBOSE_LOGS == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [pokemon.js] Sent a '+pokemon.name+' to '+member.user.tag+' ('+member.id+').'); }
      return MAIN.Send_DM(MAIN, server.id, member.id, pokemon_embed, target.bot);
    } else{
      if(content){ content += ' '+pokemon.name+' in '+area.embed+', '+pokemon.mins+'min'}
      if(MAIN.config.TIME_REMAIN && pokemon.mins < MAIN.config.TIME_REMAIN){ return; }
      if(MAIN.config.VERBOSE_LOGS == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [pokemon.js] Sent a '+pokemon.name+' to '+target.guild.name+' ('+target.id+').'); }
      return MAIN.Send_Embed(MAIN, 'pokemon', 0, server, content, pokemon_embed, target.id);
    }
  } else {

    // RETURN FOR NULL CP
    if(sighting.cp == null){ return; }

    // DETERMINE MOVE NAMES AND TYPES
    pokemon.move_name_1 = sighting.locale.move_1;
    pokemon.move_type_1 = MAIN.emotes[MAIN.masterfile.moves[sighting.move_1].type.toLowerCase()];
    pokemon.move_name_2 = sighting.locale.move_2;
    pokemon.move_type_2 = MAIN.emotes[MAIN.masterfile.moves[sighting.move_2].type.toLowerCase()];

    // DETERMINE HEIGHT, WEIGHT AND SIZE
    pokemon.height = Math.floor(sighting.height*100)/100;
    pokemon.weight = Math.floor(sighting.weight*100)/100;
    pokemon.size = sighting.size;

    // POKEMON STATS
    pokemon.attack = sighting.individual_attack;
    pokemon.defense = sighting.individual_defense;
    pokemon.stamina = sighting.individual_stamina;
    pokemon.level = sighting.pokemon_level;
    pokemon.cp = sighting.cp;
    pokemon.encounter_id = sighting.encounter_id;

    // CREATE AND SEND EMBED
    pokemon_embed = Embed_Config(pokemon);
    if(MAIN.debug.PROCESSING_SPEED == 'ENABLED'){
      let difference = Math.round((new Date().getTime() - sighting.wdrReceived) / 10)/100;
      pokemon_embed.setFooter('Latency: '+difference+'s');
    }

    // CHECK IF TARGET IS A MEMBER OR A CHANNEL
    if(member){
      if (MAIN.config.TIME_REMAIN_SUBS && pokemon.mins < MAIN.config.TIME_REMAIN_SUBS) { return; }
      if(MAIN.config.VERBOSE_LOGS == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [pokemon.js] Sent a '+pokemon.name+' to '+member.user.tag+' ('+member.id+').'); }
      return MAIN.Send_DM(MAIN, server.id, member.id, pokemon_embed, target.bot);
    } else{
      if(content){ content += ' '+pokemon.name+' in '+area.embed+', '+pokemon.mins+'min'}
      if(MAIN.config.TIME_REMAIN && pokemon.mins < MAIN.config.TIME_REMAIN){ return; }
      if(MAIN.config.VERBOSE_LOGS == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [pokemon.js] Sent a '+pokemon.name+' to '+target.guild.name+' ('+target.id+').'); }
      return MAIN.Send_Embed(MAIN, 'pokemon', 0, server, content, pokemon_embed, target.id);
    }
  }
}
