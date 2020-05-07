const GeoTz = require('geo-tz');


module.exports.run = async (MAIN, message, prefix, discord) => {

  // DECLARE VARIABLES
  let member = { displayAvatarURL: message.author.displayAvatarURL };

  // GET USER NICKNAME
  if(message.member){
    if(message.nickname){ nickname = message.nickname; } else{ member.nickname = message.member.user.username; }
  } else{
    member.nickname = message.author.username;
  }

  let requestAction = new MAIN.Discord.MessageEmbed()
  .setAuthor(member.nickname, )
  .setTitle('What Pokémon was the Community Day for?')
  .setFooter('Type the name of desired Poké, no command prefix required.');

  message.channel.send(requestAction).catch(console.error).then( msg => {
    initiate_collector(MAIN, 'start', message, msg, member, prefix, discord);
    if(MAIN.config.Tidy_Channel == 'ENABLED' && discord.command_channels.indexOf(message.channel.id) < 0 && discord.spam_channels.indexOf(message.channel.id) < 0 && message.channel.type != 'dm' && message){ message.delete(); }
    return;
  });
}

// CREATE THE TIME FRAME AND VIEW
async function pokemon_view(MAIN, message, member, pokemon, prefix, discord){

  // DEFINED THE SUBSCRIPTION OBJECT
  let date = {};

  // RETRIEVE POKEMON NAME FROM USER
  date.start = await sub_collector(MAIN,'start',member,message,'Respond with start date and time. (YYYY-MM-DD 24:00)',date,discord);
  if(date.start == 'cancel'){ return subscription_cancel(MAIN,member, message, prefix, discord); }
  else if(date.start == 'time'){ return subscription_timedout(MAIN,member, message, prefix, discord) }

  // RETRIEVE POKEMON NAME FROM USER
  date.end = await sub_collector(MAIN,'end',member,message,'Respond with end date and time. (YYYY-MM-DD 24:00)',date,discord);
  if(date.end == 'cancel'){ return subscription_cancel(MAIN,member, message, prefix, discord); }
  else if(date.end == 'time'){ return subscription_timedout(MAIN,member, message, prefix, discord) }

  let guild = MAIN.guilds.cache.get(discord.id);
  let timezone = GeoTz(discord.geofence[0][1][1], discord.geofence[0][1][0])[0];
  let pokemon_id = pokemon.pokemon_id, form_id = pokemon.form;
  let locale = await MAIN.Get_Data(MAIN, pokemon);

  let sprite = MAIN.Get_Sprite(MAIN, pokemon);
  let role_id = '';
  let pokemon_name = locale.pokemon_name;
  let pokemon_color = locale.color, pokemon_type = locale.type;

  let start = Math.round(MAIN.Bot_Time(date.start, 'unix', timezone));
  let end = Math.round(MAIN.Bot_Time(date.end, 'unix', timezone));

  MAIN.rdmdb.query(`SELECT
    COUNT(id) AS total,
    SUM(iv = 100) AS iv100,
    SUM(iv = 0) AS iv0,
    SUM(iv > 0) AS with_iv,
    SUM(iv IS NULL) AS without_iv,
    SUM(iv > 90 AND iv < 100) AS iv90,
    SUM(iv >= 1 AND iv < 50) AS iv_1_49,
    SUM(iv >= 50 AND iv < 80) AS iv_50_79,
    SUM(iv >= 80 AND iv < 90) AS iv_80_89,
    SUM(iv >= 90 AND iv < 100) AS iv_90_99,
    SUM(gender = 1) AS male,
    SUM(gender = 2) AS female,
    SUM(gender = 3) AS genderless,
    SUM(level >= 1 AND level <= 9) AS level_1_9,
    SUM(level >= 10 AND level <= 19) AS level_10_19,
    SUM(level >= 20 AND level <= 29) AS level_20_29,
    SUM(level >= 30 AND level <= 35) AS level_30_35,
    SUM(shiny = 1) AS shiny
    FROM
    pokemon
    WHERE
    pokemon_id = ?
    AND first_seen_timestamp >= ?
    AND first_seen_timestamp <= ?`, [pokemon_id, start, end], function (error, stats, fields) {
      if(!stats || stats[0].total == 0 ){return message.reply('No Data Found').then(m => m.delete(5000)).catch(console.error);}
      let genders = '';
      if(stats[0].genderless == 0){
        genders = '**Male**: '+stats[0].male.toLocaleString()+'\n**Female**: '+stats[0].female.toLocaleString();
      } else {
        genders = '**Genderless**: '+stats[0].genderless.toLocaleString();
      }
      let scanned = stats[0].with_iv
      let shinies = stats[0].shiny
      let probability = ( scanned / shinies ).toFixed()
      let chart_embed = new MAIN.Discord.MessageEmbed()
      .setColor(pokemon_color)
      .setThumbnail(sprite)
      .setTitle('**'+pokemon_name+'** '+pokemon_type)
      .addField('Total Encounters: ',
      '**IV Scanned**: '+scanned.toLocaleString()
      +'\n**Without IV**: '+stats[0].without_iv.toLocaleString()
      +'\n**Overall Total**: '+stats[0].total.toLocaleString()
      +'\n**Shiny Encountered**: '+shinies.toLocaleString()
      +'\n**Shiny Probability**: 1/'+probability, true)
      .addField('IV Spread:',
      '**0%**: '+stats[0].iv0.toLocaleString()
      +'\n**01-49%**: '+stats[0].iv_1_49.toLocaleString()
      +'\n**50-79%**: '+stats[0].iv_50_79.toLocaleString()
      +'\n**80-89%**: '+stats[0].iv_80_89.toLocaleString()
      +'\n**90-99%**: '+stats[0].iv_90_99.toLocaleString()
      +'\n**100%**: '+stats[0].iv100.toLocaleString(), true)
      .addField('Level Spread:',
      '**01-09**: '+stats[0].level_1_9.toLocaleString()
      +'\n**10-19**: '+stats[0].level_10_19.toLocaleString()
      +'\n**20-29**: '+stats[0].level_20_29.toLocaleString()
      +'\n**30-35**: '+stats[0].level_30_35.toLocaleString(), true)
      .addField('Genders Encountered:', genders, true);

      if(discord.spam_channels.indexOf(message.channel.id) >= 0){
        return MAIN.Send_Embed(MAIN, 'chart', 0, discord, role_id, chart_embed, message.channel.id);
      } else {
        guild.members.fetch(message.author.id).then( TARGET => {
          return TARGET.send(chart_embed).catch(console.error);
        });
      }
    });
}


// SUB COLLECTOR FUNCTION
function sub_collector(MAIN,type,member,message,requirements,date,discord){
  return new Promise( function(resolve, reject) {

    // DELCARE VARIABLES
    let timeout = true, instruction = '';

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMessage.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, { time: 60000 });

    switch(type){

      // Start
      case 'start':
      case 'end':
        instruction = new MAIN.Discord.MessageEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('What was the '+type+' day and time?')
          .setFooter(requirements); break;

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

          // GET START END VALID INPUT
          case type.indexOf('start')>=0:
          case type.indexOf('end')>=0:
            collector.stop(message.content);
            break;
        }
      });

      // COLLECTOR ENDED
      collector.on('end', (collected,reason) => {
        msg.delete();
        resolve(reason);
      });
    });
  });
}

function subscription_cancel(MAIN,member, message, prefix, discord){
  let subscription_cancel = new MAIN.Discord.MessageEmbed().setColor('00ff00')
    .setAuthor(member.nickname, member.displayAvatarURL)
    .setTitle('Subscription Cancelled.')
    .setDescription('Nothing has been Saved.')
    .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'cancel', message, msg, member, prefix, discord);
  });
}

function subscription_timedout(MAIN,member, message, prefix, discord){
  let subscription_cancel = new MAIN.Discord.MessageEmbed().setColor('00ff00')
    .setAuthor(member.nickname, member.displayAvatarURL)
    .setTitle('Your Subscription Has Timed Out.')
    .setDescription('Nothing has been Saved.')
    .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'time', message, msg, member, prefix, discord);
  });
}

function initiate_collector(MAIN, source, message, msg, member, prefix, discord){
  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.author.id == message.author.id;
  const collector = message.channel.createMessageCollector(filter, { time: 60000 });
  let msg_count = 0;

  // FILTER COLLECT EVENT
  collector.on('collect', message => {
    if(MAIN.config.Tidy_Channel == 'ENABLED' && discord.command_channels.indexOf(message.channel.id) < 0 && discord.spam_channels.indexOf(message.channel.id) < 0 && message.channel.type != 'dm' && message){ message.delete(); }
    let pokemon = message.content.toLowerCase();

    if (pokemon != 'NaN' && pokemon < 809) {
      collector.stop(pokemon);
    }

    let searched = MAIN.Pokemon_ID_Search(MAIN, pokemon);
    if (searched) {
      collector.stop(searched);
    }

    if (pokemon === 'cancel' || pokemon === 'time'){
      collector.stop(pokemon);
    } else { collector.stop('retry'); }
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
      pokemon_view(MAIN, message, member, reason, prefix, discord);
    } return;
  });
}
