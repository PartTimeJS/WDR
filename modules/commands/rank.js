const Fuzzy = require('fuzzy');

const InsideGeojson = require('point-in-geopolygon');
const pvp = require('../base/pvp.js');

module.exports.run = async (MAIN, message, prefix, discord) => {

  let available_stops = [];

  // GET USER NICKNAME
  let nickname = '';
  if(message.member){
    if(message.member.nickname){ nickname = message.member.nickname; } else{ nickname = message.member.user.username; }
  } else{
    nickname = message.author.username;
  }

  let request_action = new MAIN.Discord.RichEmbed()
    .setAuthor(nickname, message.author.displayAvatarURL)
    .setTitle('What rank do you want to search for?')
    .setDescription('`Great`  »  Great League.\n'
                   +'`Ultra`  »  Ultra League.')
    .setFooter('Type the league, no command prefix required.');

  message.channel.send(request_action).catch(console.error).then( msg => {
      return initiate_collector(MAIN, 'start', message, msg, nickname, prefix, discord);
  });
}

// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(MAIN, message, nickname, prefix, league, discord){

  // DEFINED THE SUBSCRIPTION OBJECT
  let rank = {}, ranks = {}, filter = {}, got_name = false;
  switch (league) {
    case 'Great':
      filter.min_cp_range = 0;
      filter.max_cp_range = 1500;
      break;
    case 'Ultra':
      filter.min_cp_range = 1500;
      filter.max_cp_range = 2500;
      break;
    default:
      filter.min_cp_range = 0;
      filter.max_cp_range = 5000;
  }

  // RETRIEVE POKEMON NAME FROM USER
  do {
    rank.pokemon = await sub_collector(MAIN, 'Pokemon', nickname, message, league,'Respond with Pokémon name. Names are not case-sensitive.', rank, discord);
    if(rank.pokemon){ got_name = true }
    if(rank.pokemon == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    else if(rank.pokemon == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord); }

  } while(got_name == false);

  // RETRIEVE TYPE NAME FROM USER
  rank.stats = await sub_collector(MAIN,'Stats',nickname,message, league,'Respond with stats in the format of ATK/DEF/STA (i.e. 2/14/15)', rank,discord);
  if(rank.stats == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
  else if(rank.stats == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord); }

  if(rank.stats == 'top'){
    ranks = await pvp.CalculateTopRanks(MAIN, rank.pokemon.pokemon_id, rank.pokemon.form, filter.max_cp_range);
  } else{
    ranks = await pvp.SearchTopRank(MAIN, rank, filter);
  }

  // DETERMINE BASE STATS
  let base_attack = '', base_defense = '', base_stamina = '';
  if (!MAIN.masterfile.pokemon[rank.pokemon.pokemon_id].attack) {
    base_attack = MAIN.masterfile.pokemon[rank.pokemon.pokemon_id].forms[rank.pokemon.form].attack;
    base_defense = MAIN.masterfile.pokemon[rank.pokemon.pokemon_id].forms[rank.pokemon.form].defense;
    base_stamina = MAIN.masterfile.pokemon[rank.pokemon.pokemon_id].forms[rank.pokemon.form].stamina;
  } else {
    base_attack = MAIN.masterfile.pokemon[rank.pokemon.pokemon_id].attack;
    base_defense = MAIN.masterfile.pokemon[rank.pokemon.pokemon_id].defense;
    base_stamina = MAIN.masterfile.pokemon[rank.pokemon.pokemon_id].stamina;
  }
  // DETERMINE CURRENT STATS
  let current_CPMultiplier = MAIN.cp_multiplier[ranks.level];
  let current_attack = Math.round((base_attack+rank.stats.atk)*current_CPMultiplier * 100)/100;
  let current_defense = Math.round((base_defense+rank.stats.def)*current_CPMultiplier * 100)/100;
  let current_stamina = Math.floor((base_stamina+rank.stats.sta)*current_CPMultiplier);

  // DETERMINE BEST STATS
  let best_CPMultiplier = MAIN.cp_multiplier[ranks.topRank.level];
  let best_attack = Math.round((base_attack+ranks.topRank.atk)*best_CPMultiplier * 100)/100;
  let best_defense = Math.round((base_defense+ranks.topRank.def)*best_CPMultiplier * 100)/100;
  let best_stamina = Math.floor((base_stamina+ranks.topRank.sta)*best_CPMultiplier);

  // DEFINE VARIABLES
  let sprite = MAIN.Get_Sprite(MAIN, rank.pokemon);
  let locale = await MAIN.Get_Locale(MAIN, rank.pokemon, discord);
  let typing = await MAIN.Get_Typing(MAIN, rank.pokemon);

  // BUILD EMBED
  let rank_embed = new MAIN.Discord.RichEmbed()
  .setColor(typing.color)
  .setThumbnail(sprite)
  .addField('**'+locale.pokemon_name+'** '+locale.form+typing.type,league+' League Ranks')
  // SEARCHED STATS
  .addField('You searched for:','**IV**: '+rank.stats.atk+'/'+rank.stats.def+'/'+rank.stats.sta+' **('+ranks.percent+'%)**\n'+
                                '**CP**: '+pvp.CalculateCP(MAIN,rank.pokemon.pokemon_id,rank.pokemon.form,rank.stats.atk,rank.stats.def,rank.stats.sta,ranks.level)+'\n'+
                                '**Level**: '+ranks.level+'\n'+
                                '**Rank**: '+ranks.rank+'/4096\n'+
                                '**Stats**: *ATK*: '+current_attack+' *DEF*: '+current_defense+' *STA*: '+current_stamina, true)
  // TOP STATS
  .addField('Best Availble Stats:','**IV**: '+ranks.topRank.atk+'/'+ranks.topRank.def+'/'+ranks.topRank.sta+' **('+ranks.topRank.percent+'%)**\n'+
                                   '**CP**: '+pvp.CalculateCP(MAIN,rank.pokemon.pokemon_id,rank.pokemon.form,ranks.topRank.atk,ranks.topRank.def,ranks.topRank.sta,ranks.topRank.level)+'\n'+
                                   '**Level**: '+ranks.topRank.level+'\n'+
                                   '**Rank**: '+ranks.topRank.rank+'/4096\n'+
                                   '**Stats**: *ATK*: '+best_attack+' *DEF*: '+best_defense+' *STA*: '+best_stamina, true);

  if(message.channel.type == 'dm'){
    return message.channel.send(rank_embed).catch(console.error);
  }
  else if(discord.spam_channels.indexOf(message.channel.id) >= 0){
    return MAIN.Send_Embed(MAIN, 'chart', 0, discord, role_id, rank_embed, message.channel.id);
  }
  else {
    // CHECK IF THE TARGET IS A USER
    let member = MAIN.guilds.get(discord.id).members.get(message.author.id);
    if(!member){ return; }
    return member.send(rank_embed).catch(console.error);
  }
}

// SUB COLLECTOR FUNCTION
function sub_collector(MAIN, type, nickname, message, league, requirements, rank, discord){
  return new Promise(function(resolve, reject) {

    // DELCARE VARIABLES
    let timeout = true, instruction = '';

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMessage.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, { time: 30000 });

    switch(type){

      // RANK POKEMON EMBED
      case 'Pokemon':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What Pokémon would you like to evaluate for '+league+' League?')
          .setFooter(requirements); break;

      // RANK STATS EMBED
      case 'Stats':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What are the stats of '+rank.pokemon.pokemon_name+'?')
          .setFooter(requirements); break;

      // DEFAULT EMBED
      default:
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What **'+type+'** would like you like to set for **'+object+'** Invasion Notifications?')
          .setFooter(requirements);
    }

    message.channel.send(instruction).catch(console.error).then( msg => {

      // DEFINED VARIABLES
      let input = '';

      // FILTER COLLECT EVENT
      collector.on('collect', message => {
        switch(true){

          // CANCEL SUB
          case message.content.toLowerCase() == 'stop':
          case message.content.toLowerCase() == 'cancel': collector.stop('cancel'); break;

          // POKEMON NAME
          case type.indexOf('Pokemon') >= 0:
            let searched = MAIN.Pokemon_ID_Search(MAIN, message.content.toLowerCase());
            if(searched) {
              collector.stop(searched);
            } else {
              message.reply('`'+searched+'` doesn\'t appear to be a valid Pokémon name. Please check the spelling and try again.').then(m => m.delete(5000)).catch(console.error);
            } break;

          // STATS CONFIRMATION
          case type.indexOf('Stats') >= 0:
            if(message.content.toLowerCase() == 'top'){
              collector.stop('top');
            } else{
              let args = message.content.split('/');
              let stats = {atk:parseInt(args[0],10), def:parseInt(args[1],10), sta:parseInt(args[2],10)}
              switch (true) {
                case stats.atk == undefined:
                case stats.atk > 15:
                case stats.atk < 0:
                case !Number.isInteger(stats.atk):
                  message.reply('ATK: `'+stats.atk+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error);
                  break;
                case stats.def == undefined:
                case stats.def > 15:
                case stats.def < 0:
                case !Number.isInteger(stats.def):
                  message.reply('DEF: `'+stats.def+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error);
                  break;
                case stats.sta == undefined:
                case stats.sta > 15:
                case stats.sta < 0:
                case !Number.isInteger(stats.sta):
                  message.reply('ATK: `'+stats.sta+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error);
                  break;
                default:
                  collector.stop(stats);
              }
            } break;

        }
      });

      // COLLECTOR ENDED
      collector.on('end', (collected,reason) => {
        msg.delete();
        return resolve(reason);
      });
    });
  });
}

function subscription_cancel(MAIN, nickname, message, prefix, discord){
  let subscription_cancel = new MAIN.Discord.RichEmbed().setColor('00ff00')
    .setAuthor(nickname, message.author.displayAvatarURL)
    .setTitle('Subscription Cancelled.')
    .setDescription('Nothing has been Saved.')
    .setFooter('You can type \'view\', \'add\', or \'remove\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'cancel', message, msg, nickname, prefix, discord);
  });
}

function subscription_timedout(MAIN, nickname, message, prefix, discord){
  let subscription_cancel = new MAIN.Discord.RichEmbed().setColor('00ff00')
    .setAuthor(nickname, message.author.displayAvatarURL)
    .setTitle('Subscription Timed Out.')
    .setDescription('Nothing has been Saved.')
    .setFooter('You can type \'view\', \'add\', or \'remove\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'time', message, msg, nickname, prefix, discord);
  });
}

function initiate_collector(MAIN, source, message, msg, nickname, prefix, discord){
  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.author.id == message.author.id;
  const collector = message.channel.createMessageCollector(filter, { time: 60000 });

  // FILTER COLLECT EVENT
  collector.on('collect', message => {
    switch(message.content.toLowerCase()){
      case 'great': collector.stop('great'); break;
      case 'ultra': collector.stop('ultra'); break;
      default: collector.stop('end');
    }
  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', (collected,reason) => {

    // DELETE ORIGINAL MESSAGE
    msg.delete();
    switch(reason){
      case 'cancel': resolve('cancel'); break;
      case 'great': subscription_create(MAIN, message, nickname, prefix, 'Great', discord); break;
      case 'ultra': subscription_create(MAIN, message, nickname, prefix, 'Ultra', discord); break;
      default:
        if(source == 'start'){
          message.reply('Your subscription has timed out.').then(m => m.delete(5000)).catch(console.error);
        }
    } return;
  });
}
