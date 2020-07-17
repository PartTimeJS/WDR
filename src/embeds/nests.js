module.exports = async (WDR, message, nest, server, area, timezone, embed) => {
  let Embed_Config = require(WDR.Dir + '/configs/embeds/' + embed);

  let form = WDR.Master.Pokemon[nest.pokemon_id].default_form ? WDR.Master.Pokemon[nest.pokemon_id].default_form : 0;
  let locale = await WDR.Get_Data(WDR, nest);
  let typing = await WDR.Get_Typing(WDR, nest);

  // CHECK IF THE TARGET IS A USER
  let member = WDR.Bot.guilds.cache.get(server.id).members.cache.get(message.author.id);

  // VARIABLES
  let pokemon = {
    name: locale.pokemon_name,
    form: locale.form,
    // GET SPRITE IMAGE
    sprite: WDR.Get_Sprite(WDR, {
      pokemon_id: nest.pokemon_id,
      form: form
    }),

    // DETERMIND POKEMON TYPES AND WEAKNESSES
    type: typing.type,
    color: typing.color,

    // NEST INFO
    nest_name: nest.name,
    submitter: nest.nest_submitted_by ? nest.nest_submitted_by : 'Map Scanned',
    time: WDR.Time(nest.updated, 'nest', timezone),
    avg: nest.pokemon_avg,

    // LOCATION INFO
    lat: nest.lat,
    lon: nest.lon,
    area: area.embed,
    map_url: WDR.Config.FRONTEND_URL,

    // MAP LINK PROVIDERS
    google: '[Google Maps](' + await WDR.Short_URL(WDR, 'https://www.google.com/maps?q=' + nest.lat + ',' + nest.lon) + ')',
    apple: '[Apple Maps](' + await WDR.Short_URL(WDR, 'http://maps.apple.com/maps?daddr=' + nest.lat + ',' + nest.lon + '&z=10&t=s&dirflg=d') + ')',
    waze: '[Waze](' + await WDR.Short_URL(WDR, 'https://www.waze.com/ul?ll=' + nest.lat + ',' + nest.lon + '&navigate=yes') + ')',
    pmsf: '[Scan Map](' + await WDR.Short_URL(WDR, WDR.Config.FRONTEND_URL + '?lat=' + nest.lat + '&lon=' + nest.lon + '&zoom=15') + ')',
    rdm: '[Scan Map](' + await WDR.Short_URL(WDR, WDR.Config.FRONTEND_URL + '@/' + nest.lat + '/' + nest.lon + '/15') + ')',
  }

  nest_embed = Embed_Config(WDR, pokemon);

  if (message.channel.type == 'dm') {
    return message.channel.send(nest_embed).catch(console.error);
  } else if (server.spam_channels.indexOf(message.channel.id) >= 0) {
    return WDR.Send_Embed(WDR, 'nest', 0, server, '', nest_embed, message.channel.id);
  } else {
    if (!member) {
      return;
    }
    member.send(nest_embed).catch(console.error);
  }
}