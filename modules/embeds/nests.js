

module.exports.run = async (MAIN, message, nest, server, area, timezone, embed) => {
  let Embed_Config = require('../../embeds/'+embed);

  let form = MAIN.masterfile.pokemon[nest.pokemon_id].default_form ? MAIN.masterfile.pokemon[nest.pokemon_id].default_form : 0;
  let locale = await MAIN.Get_Names(MAIN, nest);
  let typing = await MAIN.Get_Typing(MAIN, nest);

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.get(server.id).members.get(message.author.id);

  // VARIABLES
  let pokemon = {
    name: locale.pokemon_name, form: locale.form,
    // GET SPRITE IMAGE
    sprite: MAIN.Get_Sprite(MAIN, {pokemon_id: nest.pokemon_id, form: form}),

    // DETERMIND POKEMON TYPES AND WEAKNESSES
    type: typing.type,
    color: typing.color,

    // NEST INFO
    nest_name: nest.name,
    submitter: nest.nest_submitted_by ? nest.nest_submitted_by : 'Map Scanned',
    time: MAIN.Bot_Time(nest.updated, 'nest', timezone),
    avg: nest.pokemon_avg,

    // LOCATION INFO
    lat: nest.lat, lon: nest.lon,
    area: area.embed,
    map_url: MAIN.config.FRONTEND_URL,

    // MAP LINK PROVIDERS
    google: '[Google]('+await MAIN.Short_URL(MAIN, 'https://www.google.com/maps?q='+nest.lat+','+nest.lon)+')',
    apple: '[Apple]('+await MAIN.Short_URL(MAIN, 'http://maps.apple.com/maps?daddr='+nest.lat+','+nest.lon+'&z=10&t=s&dirflg=d')+')',
    waze: '[Waze]('+await MAIN.Short_URL(MAIN, 'https://www.waze.com/ul?ll='+nest.lat+','+nest.lon+'&navigate=yes')+')',
    pmsf: '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'?lat='+nest.lat+'&lon='+nest.lon+'&zoom=15')+')',
    rdm: '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'@/'+nest.lat+'/'+nest.lon+'/15')+')',
  }

  nest_embed = Embed_Config(pokemon);

  if(message.channel.type == 'dm'){
    return message.channel.send(nest_embed).catch(console.error);
  } else if(server.spam_channels.indexOf(message.channel.id) >= 0){
    return MAIN.Send_Embed(MAIN, 'nest', 0, server, '', nest_embed, message.channel.id);
  } else {
    if(!member){ return; }
    member.send(nest_embed).catch(console.error);
  }
}
