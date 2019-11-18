
const pvp = require('../base/pvp.js');

module.exports.run = async (MAIN, message, pokemon, server) => {
      // CHECK IF THE TARGET IS A USER
      let member = MAIN.guilds.get(server.id).members.get(message.author.id);

      // DETERMINE POKEMON NAME
      let locale = await MAIN.Get_Locale(MAIN, pokemon, server);
      let typing = await MAIN.Get_Typing(MAIN, pokemon);

      let pokemon_name = locale.pokemon_name, pokemon_id = pokemon.pokemon_id, form_id = pokemon.form;
      let evolutions = pokemon_name;
      let pokemon_type = typing.type, weaknesses = typing.weaknesses, pokemon_color = typing.color;
      let attack = '', defense = '', stamina = '', form_name = locale.form;
      let height = '', weight = '';
      let candy = MAIN.masterfile.pokemon[pokemon_id].candy;
      let buddy = MAIN.masterfile.pokemon[pokemon_id].buddy_distance;
      let thirdmove = MAIN.masterfile.pokemon[pokemon_id].thirdmove;
      let catch_rate = Math.round(MAIN.masterfile.pokemon[pokemon_id].catch_rate * 100);
      let flee = Math.round(MAIN.masterfile.pokemon[pokemon_id].flee_rate * 100);
      let male = Math.round(MAIN.masterfile.pokemon[pokemon_id].male_percent * 100);
      let female = Math.round(MAIN.masterfile.pokemon[pokemon_id].female_percent * 100);
      let genders = '**Male**: '+male+'% **Female**: '+female+'%'
      if (male == 0 && female == 0){
        genders = '**Genderless**'
      }

      // DETERMINE FORM TYPE(S), EMOTE AND COLOR
      if (!MAIN.masterfile.pokemon[pokemon_id].attack) {
        attack = MAIN.masterfile.pokemon[pokemon_id].forms[form_id].attack;
        defense = MAIN.masterfile.pokemon[pokemon_id].forms[form_id].defense;
        stamina = MAIN.masterfile.pokemon[pokemon_id].forms[form_id].stamina;
        height = Math.floor(MAIN.masterfile.pokemon[pokemon_id].forms[form_id].height*100)/100;
        weight = Math.floor(MAIN.masterfile.pokemon[pokemon_id].forms[form_id].weight*100)/100;
      } else {
        attack = MAIN.masterfile.pokemon[pokemon_id].attack;
        defense = MAIN.masterfile.pokemon[pokemon_id].defense;
        stamina = MAIN.masterfile.pokemon[pokemon_id].stamina;
        height = Math.floor(MAIN.masterfile.pokemon[pokemon_id].height*100)/100;
        weight = Math.floor(MAIN.masterfile.pokemon[pokemon_id].weight*100)/100;
      }

      //EVOLUTION FAMILY
      for (key in MAIN.masterfile.pokemon) { //Find Previous Evolutions
        for(var i = 0; i < MAIN.masterfile.pokemon[key].evolutions.length; i++) {
          if (MAIN.masterfile.pokemon[key].evolutions[i] == pokemon_id) {
            let base_evolve = await MAIN.Get_Locale(MAIN, {pokemon_id: key},server)
            evolutions = base_evolve.pokemon_name+' -> '+evolutions;
            evolve = key;

            for (key in MAIN.masterfile.pokemon) {
              for(var x = 0; x < MAIN.masterfile.pokemon[evolve].evolutions.length; x++) {
                if (MAIN.masterfile.pokemon[key].evolutions[x] == evolve) {
                  let first_evolve = await MAIN.Get_Locale(MAIN, {pokemon_id: key},server);
                  evolutions = first_evolve.pokemon_name+' -> '+evolutions;
                  break;
                }
              }
            }
            break;
          }
        }
      }
      if (MAIN.masterfile.pokemon[pokemon_id].evolutions[0]){ //Find Next Evolution
        evolutions += ' -> ';
        for(var i = 0; i < MAIN.masterfile.pokemon[pokemon_id].evolutions.length; i++) {
          let second_evolve = await MAIN.Get_Locale(MAIN, {pokemon_id: MAIN.masterfile.pokemon[pokemon_id].evolutions[i]},server);
          evolutions += second_evolve.pokemon_name+', ';
          evolve = parseInt(MAIN.masterfile.pokemon[pokemon_id].evolutions[i]);
          if (evolve != 'NaN' && MAIN.masterfile.pokemon[evolve]) {
            evolutions = evolutions.slice(0,-2);
            evolutions += ' -> ';
            for(var x = 0; x < MAIN.masterfile.pokemon[evolve].evolutions.length; x++) {
              let third_evolve = await MAIN.Get_Locale(MAIN, {pokemon_id: MAIN.masterfile.pokemon[evolve].evolutions[x]},server);
              evolutions += third_evolve.pokemon_name+', ';
            }
          }
        }
        evolutions = evolutions.slice(0,-2);
      }

      // GET SPRITE IMAGE
      let sprite = MAIN.Get_Sprite(MAIN, pokemon);

      let dex_embed = new MAIN.Discord.RichEmbed()
      .setColor(pokemon_color)
      .setThumbnail(sprite)
      .setTitle('**'+pokemon_name+'** '+form_name+'(#'+pokemon_id+') '+pokemon_type)
      .setDescription(MAIN.masterfile.pokemon[pokemon_id].dex)
      .addField('__Evolution Family__', evolutions)
      .addField('__Weaknesses__',weaknesses,true)
      .addField('__Catch & Flee Rate__','**Catch**: '+catch_rate+'% **Flee**: '+flee+'%',true)
      .addField('__Size & Gender__',
                '**Height**: '+height+'m **Weight**: '+weight+'kg\n'
               +genders,true)
      .addField('__Base Stats__',
                '**Atk**: '+attack
             +', **Def**: '+defense
             +', **Sta**: '+stamina,true)
      .addField('__Max CPs__',
                '**Level 40**: '+pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,40)
               +' | **Level 25**: '+pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,25)
               +'\n**Level 20**: '+pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,20)
               +' | **Level 15**: '+pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,15));

      if(message.channel.type == 'dm'){
        return message.channel.send(dex_embed).catch(console.error);
      } else if(server.spam_channels.indexOf(message.channel.id) >= 0){
        return MAIN.Send_Embed(MAIN, 'dex', 0, server, '', dex_embed, message.channel.id);
      } else {
        if(!member){ return; }
        member.send(dex_embed).catch(console.error);
      }
}
