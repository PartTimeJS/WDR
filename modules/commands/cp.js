const GeoTz = require('geo-tz');

const Send_Nest = require('../embeds/nests.js');
const InsideGeojson = require('point-in-geopolygon');
const pvp = require('../base/pvp.js');

module.exports.run = async (MAIN, message, prefix, discord) => {

  // GET USER NICKNAME
  let nickname = '';
  if(message.member){
    if(message.member.nickname){ nickname = message.member.nickname; } else{ nickname = message.member.user.username; }
  } else{
    nickname = message.author.username;
  }

  let requestAction = new MAIN.Discord.RichEmbed()
  .setAuthor(nickname, message.author.displayAvatarURL)
  .setTitle('What Pokémon do you want a CP search string for?')
  .setFooter('Type the name of desired Poké, no command prefix required.');

  message.channel.send(requestAction).catch(console.error).then( msg => {
    initiate_collector(MAIN, 'start', message, msg, nickname, prefix, discord);
    if(MAIN.config.Tidy_Channel == 'ENABLED' && discord.command_channels.indexOf(message.channel.id) < 0 && discord.spam_channels.indexOf(message.channel.id) < 0 && message.channel.type != 'dm' && message){ message.delete(); }
    return;
  });
}

async function pokemon_view(MAIN, message, nickname, pokemon, prefix, discord){
  let guild = MAIN.guilds.cache.get(discord.id);
  let pokemon_id = pokemon.pokemon_id, form_id = pokemon.form;
  let locale = await MAIN.Get_Data(MAIN, pokemon);
  let sprite = MAIN.Get_Sprite(MAIN, pokemon);
  let pokemon_name = locale.pokemon_name;
  let pokemon_color = locale.color;

  // let search_string = pokemon_id+'&', role_id = '';
  // for(var level = 1; level <= 40; level++) {
  //   search_string += 'cp'+pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,level)+',';
  // } search_string = search_string.slice(0,-1);

  let search_string = '```Level CP\tLevel CP\n';
  for(var level = 1; level <= 10; level++) {
    let cp = '';
    // 1-10
    if(level <= 9){ search_string += ' '; }
    cp = pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,level);
    search_string += level+'  '+padded(cp);
    // 11-20
    cp = pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,level+10);
    search_string += '\t'+(level+10)+'  '+padded(cp)+'\n';
  }
  search_string += '``` ```Level CP\tBoosted\n';
  for(var level = 1; level <= 10; level++) {
    let cp = '';
    // 21-30
    cp = pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,level+20);
    search_string += (level+20)+'  '+padded(cp);
    // 31-35
    if(level <= 5){
      cp = pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,level+30);
      search_string += '\t'+(level+30)+' '+padded(cp)+'\n';
    } else {
      cp = pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,level+30);
      search_string += '\t'+(level+30)+' '+padded(cp)+'\n';
    }
  }
  search_string += '```';

  let chart_embed = new MAIN.Discord.RichEmbed()
  .setColor(pokemon_color)
  .setThumbnail(sprite)
  .setTitle(pokemon_name+' CP Chart')
  .setDescription(search_string);


  if(discord.spam_channels.indexOf(message.channel.id) >= 0){
    return MAIN.Send_Embed(MAIN, 'cp', 0, discord, '', chart_embed, message.channel.id);
  } else {
    guild.fetchMember(message.author.id).then( TARGET => {
      return TARGET.send(chart_embed).catch(console.error);
    });
  }
}

function padded(num) {
  let n = num.toString();
  if(num < 999){ n = ' '+n; }
  if(num < 99){ n = ' '+n; }
  return n;
}

function subscription_timedout(MAIN, nickname, message, prefix){
  let subscription_cancel = new MAIN.Discord.RichEmbed().setColor('00ff00')
  .setAuthor(nickname, message.author.displayAvatarURL)
  .setTitle('Your Subscription Has Timed Out.')
  .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'time', message, msg, nickname, prefix, discord);
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

    let searched = MAIN.Pokemon_ID_Search(MAIN, pokemon);
    if (searched) {
      collector.stop(searched);
    }

    if (pokemon === 'cancel' || pokemon === 'time'){
      collector.stop('cancel');
    } else { collector.stop('retry'); }
  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', (collected,reason) => {

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
      pokemon_view(MAIN, message, nickname, reason, prefix, discord);
    } return;
  });
}
