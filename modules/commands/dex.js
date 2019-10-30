const GeoTz = require('geo-tz');
const Discord = require('discord.js');
const Send_Dex = require('../embeds/dex.js');

module.exports.run = async (MAIN, message, prefix, discord) => {
  // DECLARE VARIABLES
  let nickname = '';

  // GET USER NICKNAME
  if(message.member){
    if(message.member.nickname){ nickname = message.member.nickname; } else{ nickname = message.member.user.username; }
  } else{
    nickname = message.author.username;
  }

  let requestAction = new Discord.RichEmbed()
  .setAuthor(nickname, message.author.displayAvatarURL)
  .setTitle('What Pokémon do you want to find out more about?')
  .setFooter('Type the name of desired Pokémon, no command prefix required.');

  message.channel.send(requestAction).catch(console.error).then( msg => {
    initiate_collector(MAIN, 'start', message, msg, nickname, prefix, discord);
    if(MAIN.config.Tidy_Channel == 'ENABLED' && discord.command_channels.indexOf(message.channel.id) < 0 && discord.spam_channels.indexOf(message.channel.id) < 0 && message.channel.type != 'dm' && message){ message.delete(); }
    return;
  });

}

function pokemon_view(MAIN, message, nickname, pokemon, prefix, discord){
  new Promise(async function(resolve, reject) {
    Send_Dex.run(MAIN, message, pokemon, discord);
    return message.reply('Entry sent, check your inbox if not in the channel.')
    .then(m => m.delete(5000)).catch(console.error);
  });
}

async function initiate_collector(MAIN, source, message, msg, nickname, prefix, discord){
  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.author.id == message.author.id;
  const collector = message.channel.createMessageCollector(filter, { time: 60000 });
  let msg_count = 0;

  // FILTER COLLECT EVENT
  await collector.on('collect', message => {
    if(MAIN.config.Tidy_Channel == 'ENABLED' && discord.command_channels.indexOf(message.channel.id) < 0 && discord.spam_channels.indexOf(message.channel.id) < 0 && message.channel.type != 'dm' && message){ message.delete(); }
    let pokemon = message.content.toLowerCase();

    if (pokemon != 'NaN' && pokemon < 809) {
      collector.stop({pokemon_id: pokemon.split(' ')[0], form: pokemon.split(' ')[1]});
    }

    let searched = MAIN.Pokemon_ID_Search(pokemon);
    if (searched) {
      collector.stop(searched);
    }

    if (pokemon === 'cancel' || pokemon === 'time'){
      collector.stop('cancel');
    } else { collector.stop('retry'); }
  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', async (collected,reason) => {

    // DELETE ORIGINAL MESSAGE
    msg.delete();
    switch(reason){
      case 'cancel': break;
      case 'time': if(source == 'start'){
        message.reply('Your subscription has timed out.').then(m => m.delete(5000)).catch(console.error);
      } break;
      case 'retry':
      message.reply('Please check your spelling, and retry.').then(m => m.delete(5000)).catch(console.error);
      break;
      default:
      return pokemon_view(MAIN, message, nickname, reason, prefix, discord);
    }
    return;
  });
}
