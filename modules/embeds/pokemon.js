const Discord = require('discord.js');

module.exports.run = async (MAIN, has_iv, target, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, content, embed) => {
  let Embed_Config = require('../../embeds/'+embed.embed), pokemon_embed = {};

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.get(server.id).members.get(target.user_id);

  // VARIABLES POKEMON NAME, FORM AND TYPE EMOTES
  let typing = await MAIN.Get_Typing(MAIN, sighting, server);
  let pokemon = {
    name: sighting.locale.pokemon_name,
    form: sighting.locale.form,
    gender: ' ',

    // GET SPRITE IMAGE
    sprite: await MAIN.Get_Sprite(MAIN, sighting),

    // Round IV
    iv: Math.round(internal_value),

    // DETERMIND POKEMON TYPES AND WEAKNESSES
    type: typing.type,
    type_noemoji: typing.type_noemoji,
    color: typing.color,
    weather_boost: ' | ',

    // GET LOCATION INFO
    lat: sighting.latitude,
    lon: sighting.longitude,
    area: embed_area,
    map_url: MAIN.config.FRONTEND_URL,

    // MAP LINK PROVIDERS
    google: '[Google]('+await MAIN.Short_URL(MAIN, 'https://www.google.com/maps?q='+sighting.latitude+','+sighting.longitude)+')',
    apple: '[Apple]('+await MAIN.Short_URL(MAIN, 'http://maps.apple.com/maps?daddr='+sighting.latitude+','+sighting.longitude+'&z=10&t=s&dirflg=d')+')',
    waze: '[Waze]('+await MAIN.Short_URL(MAIN, 'https://www.waze.com/ul?ll='+sighting.latitude+','+sighting.longitude+'&navigate=yes')+')',
    pmsf: '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'?lat='+sighting.latitude+'&lon='+sighting.longitude+'&zoom=15')+')',
    rdm: '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'@/'+sighting.latitude+'/'+sighting.longitude+'/15')+')',

    // GET STATIC MAP TILE
    map_img: await MAIN.Static_Map_Tile(MAIN, sighting.latitude, sighting.longitude, 'pokemon'),
    tile: 'https://static-maps.yandex.ru/1.x/?lang=en-US&ll='+sighting.longitude+','+sighting.latitude+'&z=15&l=map&size=400,220&pt='+sighting.longitude+','+sighting.latitude+',pm2rdl'
  };

  // IDENTIFY DITTO AND ALTER DISPLAY NAME
  if(sighting.pokemon_id == 132){
    let old = await MAIN.Get_Locale(MAIN, {pokemon_id: sighting.disguise}, server);
    pokemon.name += ' ('+old.pokemon_name+')';
  }

  // DESPAWN VERIFICATION
  pokemon.verified = sighting.disappear_time_verified ? MAIN.emotes.checkYes : MAIN.emotes.yellowQuestion;

  // DETERMINE DESPAWN TIME
  pokemon.time = await MAIN.Bot_Time(sighting.disappear_time, '1', timezone);
  pokemon.mins = Math.floor((sighting.disappear_time-(time_now/1000))/60);
  pokemon.secs = Math.floor((sighting.disappear_time-(time_now/1000)) - (pokemon.mins*60));

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
      if(content){ content += ' '+pokemon.name+' in '+embed_area+', '+pokestop.mins+'min'}
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
      if(content){ content += ' '+pokemon.name+' in '+embed_area+', '+pokestop.mins+'min'}
      if(MAIN.config.TIME_REMAIN && pokemon.mins < MAIN.config.TIME_REMAIN){ return; }
      if(MAIN.config.VERBOSE_LOGS == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [pokemon.js] Sent a '+pokemon.name+' to '+target.guild.name+' ('+target.id+').'); }
      return MAIN.Send_Embed(MAIN, 'pokemon', 0, server, content, pokemon_embed, target.id);
    }
  }
}
