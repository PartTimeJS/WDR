const GeoTz = require('geo-tz');

const Send_Nest = require('../embeds/nests.js');
const InsideGeojson = require('point-in-geopolygon');

module.exports.run = async (MAIN, message, prefix, discord) => {

  // GET USER NICKNAME
  let nickname = '';
  if(message.member){
    if(message.member.nickname){ nickname = message.member.nickname; } else{ nickname = message.member.user.username; }
  } else{
    nickname = message.author.username;
  }

  let requestAction = new MAIN.Discord.MessageEmbed()
  .setAuthor(nickname, message.author.displayAvatarURL)
  .setTitle('What Pokémon do you want stats for?\nAnd How many days back do you want to search? (7 Max)')
  .setFooter('Type the name of desired Poké, followed by the number of days in the past you want to search, no command prefix required. If you do not specify the number of days, it will search all sightings in the last hour.');

  message.channel.send(requestAction).catch(console.error).then( msg => {
    initiate_collector(MAIN, 'start', message, msg, nickname, prefix, discord);
    if(MAIN.config.Tidy_Channel == 'ENABLED' && discord.command_channels.indexOf(message.channel.id) < 0 && discord.spam_channels.indexOf(message.channel.id) < 0 && message.channel.type != 'dm' && message){ message.delete(); }
    return;
  });
}

async function pokemon_view(MAIN, message, nickname, target, prefix, discord){
  let guild = MAIN.guilds.cache.get(discord.id);
  let locale = await MAIN.Get_Data(MAIN, target);
  let pokemon_name = locale.pokemon_name;

  message.reply('Searching... this may take a minute. Check your inbox if not in the channel.').then(m => m.delete(5000)).catch(console.error);
  let search = '';
  if(target.duration){
    if(target.duration > 7){ target.duration = 7; }
    target.period = target.duration*86400;
  } else{
    target.period = 3600;
  }
  //console.log('TARGET',target);
  let coordinates = discord.geofence[0] + '';
  coordinates = coordinates.split(',');
  let coords = ' AND (ST_WITHIN(point(pokemon.lon,pokemon.lat), ST_GEOMFROMTEXT(\'POLYGON((', degrees = 'lon';
  coordinates.forEach((point) => {
    coords += point;
    if (degrees == 'lon') { coords += ' ';degrees = 'lat';}
    else {coords += ','; degrees = 'lon';}
  });
  coords = coords.slice(0,-1);
  coords += '))\')) )';
  //console.log(coords);

  if (target.name == 'all'){ pokemon_name = 'ALL'; }
  if (target.pokemon_id == 132){ search = 'weather > 0 AND (atk_iv < 4 OR def_iv < 4 OR sta_iv < 4 OR level < 6) AND '}
  else { search = 'pokemon_id = ? AND '; }

  let query = `SELECT COUNT(*) as total, SUM(shiny = 1) AS shiny, SUM(shiny IS NOT NULL) AS count FROM pokemon WHERE `+search+`first_seen_timestamp >= UNIX_TIMESTAMP()-`+target.period+coords;
  MAIN.rdmdb.query(query, [target.pokemon_id], function (error, stats, fields) {
    if(error){ console.error(error); }
    if(!stats){return message.reply('There have been 0 seen.');}
    let pokemon_count = stats[0].total, role_id = '';
    if(stats[0].shiny > 0){
      let probability = (stats[0].count / stats[0].shiny).toFixed();
      pokemon_count = pokemon_count+'. '+stats[0].shiny+' shiny of '+stats[0].count+' encountered with a 1/'+probability+' chance'
    }

    let stat_message = target.duration ? 'There have been '+pokemon_count+'. '+pokemon_name+' seen in '+target.duration+' day(s).' : 'There have been '+pokemon_count+'. '+pokemon_name+' seen in the last hour.';

    // SEND THE USER A DM OR TO THE CHANNEL IF IN THE CONFIG
    if(discord.spam_channels && discord.spam_channels.indexOf(message.channel.id) >= 0){
      return message.reply(stat_message);
    } else {
      guild.fetchMember(message.author.id).then( TARGET => {
        return TARGET.send(stat_message).catch(console.error);
      });
    }
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
    let args = message.content.split(' ');
    let pokemon = args[0].toString().toLowerCase();
    if(args[1] && isNaN(args[1])){
      message.reply('Invalid input. Please type <pokemon> <#ofdays>.').then(m => m.delete(5000)).catch(console.error);
    } else{
      let target = {};
      target.duration = args[1];
      target.name = pokemon;

      if (pokemon != 'NaN' && pokemon < 809) {
        target.pokemon_id = pokemon;
        collector.stop(target);
      }

      if (pokemon == 'all'){
        collector.stop(target);
      }

      let searched = MAIN.Pokemon_ID_Search(MAIN,pokemon);
      if (searched) {
        searched.duration = args[1];
        collector.stop(searched);
      }

      if (pokemon === 'cancel' || pokemon === 'time'){
        collector.stop('cancel');
      } else { collector.stop('retry'); }
    }

  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', (collected,reason) => {

    // DELETE ORIGINAL MESSAGE
    msg.delete();
    switch(reason){
      case 'cancel': break;
      case 'time':
      if(source == 'start'){
        message.reply('Your subscription has timed out.').then(m => m.delete(5000)).catch(console.error);
      } break;
      case 'retry':
        message.reply('Please check your spelling, and retry.').then(m => m.delete(5000)).catch(console.error); break;
      default:
        pokemon_view(MAIN, message, nickname, reason, prefix, discord);
    } return;
  });
}
