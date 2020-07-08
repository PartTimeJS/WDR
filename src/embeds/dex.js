const pvp = require(__dirname + '/../pvp.js');

module.exports = async (WDR, message, pokemon, server) => {
  // CHECK IF THE TARGET IS A USER
  let member = WDR.Bot.guilds.cache.get(server.id).members.cache.get(message.author.id);

  // DETERMINE POKEMON NAME
  let locale = await WDR.Get_Data(WDR, pokemon);
  let typing = await WDR.Get_Typing(WDR, pokemon);

  let pokemon_name = locale.pokemon_name,
    pokemon_id = pokemon.pokemon_id,
    form_id = pokemon.form;
  let evolutions = pokemon_name;
  let pokemon_type = typing.type,
    weaknesses = typing.weaknesses,
    pokemon_color = typing.color;
  let attack = '',
    defense = '',
    stamina = '',
    form_name = locale.form;
  let height = '',
    weight = '';
  let candy = WDR.Master.Pokemon[pokemon_id].candy;
  let buddy = WDR.Master.Pokemon[pokemon_id].buddy_distance;
  let thirdmove = WDR.Master.Pokemon[pokemon_id].thirdmove;
  let catch_rate = Math.round(WDR.Master.Pokemon[pokemon_id].catch_rate * 100);
  let flee = Math.round(WDR.Master.Pokemon[pokemon_id].flee_rate * 100);
  let male = Math.round(WDR.Master.Pokemon[pokemon_id].male_percent * 100);
  let female = Math.round(WDR.Master.Pokemon[pokemon_id].female_percent * 100);
  let genders = '**Male**: ' + male + '% **Female**: ' + female + '%'
  if (male == 0 && female == 0) {
    genders = '**Genderless**'
  }

  // DETERMINE FORM TYPE(S), EMOTE AND COLOR
  if (!WDR.Master.Pokemon[pokemon_id].attack) {
    attack = WDR.Master.Pokemon[pokemon_id].forms[form_id].attack;
    defense = WDR.Master.Pokemon[pokemon_id].forms[form_id].defense;
    stamina = WDR.Master.Pokemon[pokemon_id].forms[form_id].stamina;
    height = Math.floor(WDR.Master.Pokemon[pokemon_id].forms[form_id].height * 100) / 100;
    weight = Math.floor(WDR.Master.Pokemon[pokemon_id].forms[form_id].weight * 100) / 100;
  } else {
    attack = WDR.Master.Pokemon[pokemon_id].attack;
    defense = WDR.Master.Pokemon[pokemon_id].defense;
    stamina = WDR.Master.Pokemon[pokemon_id].stamina;
    height = Math.floor(WDR.Master.Pokemon[pokemon_id].height * 100) / 100;
    weight = Math.floor(WDR.Master.Pokemon[pokemon_id].weight * 100) / 100;
  }

  //EVOLUTION FAMILY
  for (key in WDR.Master.Pokemon) { //Find Previous Evolutions
    for (var i = 0; i < WDR.Master.Pokemon[key].evolutions.length; i++) {
      if (WDR.Master.Pokemon[key].evolutions[i] == pokemon_id) {
        let base_evolve = await WDR.Get_Data(WDR, {
          pokemon_id: key
        })
        evolutions = base_evolve.pokemon_name + ' -> ' + evolutions;
        evolve = key;

        for (key in WDR.Master.Pokemon) {
          for (var x = 0; x < WDR.Master.Pokemon[evolve].evolutions.length; x++) {
            if (WDR.Master.Pokemon[key].evolutions[x] == evolve) {
              let first_evolve = await WDR.Get_Data(WDR, {
                pokemon_id: key
              });
              evolutions = first_evolve.pokemon_name + ' -> ' + evolutions;
              break;
            }
          }
        }
        break;
      }
    }
  }
  if (WDR.Master.Pokemon[pokemon_id].evolutions[0]) { //Find Next Evolution
    evolutions += ' -> ';
    for (var i = 0; i < WDR.Master.Pokemon[pokemon_id].evolutions.length; i++) {
      let second_evolve = await WDR.Get_Data(WDR, {
        pokemon_id: WDR.Master.Pokemon[pokemon_id].evolutions[i]
      });
      evolutions += second_evolve.pokemon_name + ', ';
      evolve = parseInt(WDR.Master.Pokemon[pokemon_id].evolutions[i]);
      if (evolve != 'NaN' && WDR.Master.Pokemon[evolve]) {
        evolutions = evolutions.slice(0, -2);
        evolutions += ' -> ';
        for (var x = 0; x < WDR.Master.Pokemon[evolve].evolutions.length; x++) {
          let third_evolve = await WDR.Get_Data(WDR, {
            pokemon_id: WDR.Master.Pokemon[evolve].evolutions[x]
          });
          evolutions += third_evolve.pokemon_name + ', ';
        }
      }
    }
    evolutions = evolutions.slice(0, -2);
  }

  // GET SPRITE IMAGE
  let sprite = WDR.Get_Sprite(WDR, pokemon);

  let dex_embed = new WDR.DiscordJS.MessageEmbed()
    .setColor(pokemon_color)
    .setThumbnail(sprite)
    .setTitle('**' + pokemon_name + '** ' + form_name + '(#' + pokemon_id + ') ' + pokemon_type)
    .setDescription(WDR.Master.Pokemon[pokemon_id].dex)
    .addField('__Evolution Family__', evolutions)
    .addField('__Weaknesses__', weaknesses, true)
    .addField('__Catch & Flee Rate__', '**Catch**: ' + catch_rate + '% **Flee**: ' + flee + '%', true)
    .addField('__Size & Gender__',
      '**Height**: ' + height + 'm **Weight**: ' + weight + 'kg\n' +
      genders, true)
    .addField('__Base Stats__',
      '**Atk**: ' + attack +
      ', **Def**: ' + defense +
      ', **Sta**: ' + stamina, true)
    .addField('__Max CPs__',
      '**Level 40**: ' + pvp.CalculateCP(WDR, pokemon_id, form_id, 15, 15, 15, 40) +
      ' | **Level 25**: ' + pvp.CalculateCP(WDR, pokemon_id, form_id, 15, 15, 15, 25) +
      '\n**Level 20**: ' + pvp.CalculateCP(WDR, pokemon_id, form_id, 15, 15, 15, 20) +
      ' | **Level 15**: ' + pvp.CalculateCP(WDR, pokemon_id, form_id, 15, 15, 15, 15));

  if (message.channel.type == 'dm') {
    return message.channel.send(dex_embed).catch(console.error);
  } else if (server.spam_channels.indexOf(message.channel.id) >= 0) {
    return WDR.Send_Embed(WDR, 'dex', 0, server, '', dex_embed, message.channel.id);
  } else {
    if (!member) {
      return;
    }
    member.send(dex_embed).catch(console.error);
  }
}