const Discord=require('discord.js');
const moment = require('moment-timezone');
const GeoTz = require('geo-tz');

module.exports.run = async (MAIN, message, prefix, discord) => {

  // DECLARE VARIABLES
  let nickname = '';

  // GET USER NICKNAME
  if(message.member){
    if(message.member.nickname){ nickname = message.member.nickname; } else{ nickname = message.member.user.username; }
  } else{
    nickname = message.author.username;
  }

  let request_action = new MAIN.Discord.MessageEmbed()
    .setAuthor(nickname, message.author.displayAvatarURL)
    .setTitle('What would you like to do with your Quest Subscriptions?')
    .setDescription('`view`  »  View your Subscritions.\n'
                   +'`add`  »  Add a Reward to your Subscriptions.\n'
                   +'`remove`  »  Remove a Reward from your Subscriptions.\n'
                   +'`time`  »  Change your Quest DM delivery Time.\n '
                   +'`pause` or `resume`  »  Pause/Resume Quest Subscriptions.')
    .setFooter('Type the action, no command prefix required.');

  message.channel.send(request_action).catch(console.error).then( msg => {
    return initiate_collector(MAIN, 'start', message, msg, nickname, prefix, discord);
  });
}

// PAUSE OR RESUME QUEST SUBSCRIPTIOONS
function subscription_status(MAIN, message, nickname, reason, prefix, discord){
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], function (error, user, fields) {
    if(user[0].quest_paused == 'ACTIVE' && reason == 'resume'){
      let already_active = new MAIN.Discord.MessageEmbed().setColor('ff0000')
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('Your Quest Subscriptions are already ACTIVE!')
        .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');;
      message.channel.send(already_active).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'status', message, msg, nickname, prefix, discord);
      });
    }
    else if(user[0].quest_paused == 'PAUSED' && reason == 'pause'){
      let already_paused = new MAIN.Discord.MessageEmbed().setColor('ff0000')
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('Your Quest Subscriptions are already PAUSED!')
        .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');;
      message.channel.send(already_paused).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'status', message, msg, nickname, prefix, discord);
      });
    }
    else{
      if(reason == 'pause'){ change = 'PAUSED'; }
      if(reason == 'resume'){ change = 'ACTIVE'; }
      MAIN.pdb.query(`UPDATE users SET quests_status = ? WHERE user_id = ? AND discord_id = ?`, [change, message.author.id, discord.id], function (error, user, fields) {
        if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
        else{
          let subscription_success = new MAIN.Discord.MessageEmbed().setColor('00ff00')
            .setAuthor(nickname, message.author.displayAvatarURL)
            .setTitle('Your Quest Subscriptions have been set to `'+change+'`!')
            .setDescription('Saved to the '+MAIN.config.BOT_NAME+' Database.')
            .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');;
          message.channel.send(subscription_success).catch(console.error).then( msg => {
            return initiate_collector(MAIN, 'status', message, msg, nickname, prefix, discord);
          });
        }
      });
    }
  });
}

// SUBSCRIPTION VIEW FUNCTION
async function subscription_view(MAIN, message, nickname, prefix, discord){
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], function (error, user, fields) {

    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if(!user[0].quests){ return message.reply('You have no saved Quest subscriptions.').then(m => m.delete(5000)).catch(console.error); }
    else{

      let user_quests = user[0].quests.split(',');

      if(!user_quests[0]){

        // CREATE THE EMBED
        let no_subscriptions = new MAIN.Discord.MessageEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('You do not have any Quest Subscriptions!')
          .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

        // SEND THE EMBED
        message.channel.send(no_subscriptions).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
        });
      }
      else{

        // CREATE THE EMBED
        let quest_subs = new MAIN.Discord.MessageEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Quest Subscriptions')
          .setDescription('Overall Status: `'+user[0].status+'`\n'
                         +'Quest Status: `'+user[0].quests_status+'`\n'
                         +'Delivery Time: '+user[0].alert_time)
          .addField('Your Subscriptions:','**'+user[0].quests.toString().replace(/,/g,'\n')+'**',false)
          .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

        // SEND THE EMBED
        message.channel.send(quest_subs).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
        });
      }
    }
  });
}

// QUEST TIME FUNCTION
async function subscription_time(MAIN, message, nickname, prefix, discord){

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], async function (error, user, fields) {

    // RETRIEVE QUEST NAME FROM USER
    let sub = await sub_collector(MAIN, 'Time', nickname, message, user[0].alert_time, 'Must be in 00:00 24-Hour format and between 00:00-23:00.', undefined);
    switch (sub) {
      case 'cancel':
        // CREATE THE EMBED
        let cancelled = new MAIN.Discord.MessageEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Quest Subscription Cancelled')
          .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

        // SEND THE EMBED
        message.channel.send(cancelled).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
        }); break;
      case 'time':
        // CREATE THE EMBED
        let timed_out = new MAIN.Discord.MessageEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Quest Subscription Timed Out')
          .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

        // SEND THE EMBED
        message.channel.send(timed_out).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
        }); break;
      default:
        sub = sub.split(':');
        let quest_time = moment(), timezone = GeoTz(discord.geofence[0][1][1], discord.geofence[0][1][0]);
        quest_time = moment.tz(quest_time, timezone[0]).set({hour:sub[0], minute:sub[1], second:0, millisecond:0});
        quest_time = moment.tz(quest_time, MAIN.config.TIMEZONE).format('HH:mm');
        // UPDATE THE USER'S RECORD
        MAIN.pdb.query(`UPDATE users SET alert_time = ? WHERE user_id = ? AND discord_id = ?`, [quest_time, message.author.id, discord.id], function (error, user, fields) {
          if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(5000)).catch(console.error); }
          else{
            let subscription_success = new MAIN.Discord.MessageEmbed().setColor('00ff00')
              .setAuthor(nickname, message.author.displayAvatarURL)
              .setTitle('Time Changed!')
              .setDescription('`'+sub+'` Saved to the '+MAIN.config.BOT_NAME+' Database.')
              .setFooter('You can type \'view\', \'time\' \'add\', \'remove\', \'pause\' or \'resume\'.');
            message.channel.send(subscription_success).then( msg => {
              return initiate_collector(MAIN, 'time', message, msg, nickname, prefix, discord);
            });
          }
        });
    }
  });
}

// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(MAIN, message, nickname, prefix, discord){

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], async function (error, user, fields) {

    // RETRIEVE QUEST NAME FROM USER
    let sub = await sub_collector(MAIN, 'Name', nickname, message, user[0].quests, 'Type any Pokémon name or choose from the list. A '+MAIN.emotes.checkYes+' denotes you are already subscribed to that Reward. Names are not case-sensitive.', undefined);
    switch (sub) {
      case 'cancel':
        // CREATE THE EMBED
        let cancelled = new MAIN.Discord.MessageEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Quest Subscription Cancelled')
          .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

        // SEND THE EMBED
        message.channel.send(cancelled).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
        }); break;
      case 'time':
        // CREATE THE EMBED
        let timed_out = new MAIN.Discord.MessageEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Quest Subscription Timed Out')
          .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

        // SEND THE EMBED
        message.channel.send(timed_out).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
        }); break;
      default:
        // DEFINED VARIABLES
        let quests = [];
        if(user[0].quests){
          quests = user[0].quests.split(',');
        }

        let index = quests.indexOf(sub);
        let rewards = MAIN.config.QUEST.Rewards.toString().toLowerCase().split(',');
        let reward_index = rewards.indexOf(sub.toLowerCase());

        // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
        if(index >= 0){ return message.reply('You are already subscribed to this quest reward.').then(m => m.delete(10000)).catch(console.error); }
        else if(reward_index >= 0){ quests.push(MAIN.config.QUEST.Rewards[reward_index]); }
        else { quests.push(sub); }

        // CONVERT ARRAY TO STRING
        quests = quests.toString();

        // UPDATE THE USER'S RECORD
        MAIN.pdb.query(`UPDATE users SET quests = ? WHERE user_id = ? AND discord_id = ?`, [quests, message.author.id, discord.id], function (error, user, fields) {
          if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
          else{
            let subscription_success = new MAIN.Discord.MessageEmbed().setColor('00ff00')
              .setAuthor(nickname, message.author.displayAvatarURL)
              .setTitle(sub+' Subscription Complete!')
              .setDescription('Saved to the '+MAIN.config.BOT_NAME+' Database.')
              .setFooter('You can type \'view\', \'time\' \'add\', \'remove\', \'pause\' or \'resume\'.');
            message.channel.send(subscription_success).then( msg => {
              return initiate_collector(MAIN, 'create', message, msg, nickname, prefix, discord);
            });
          }
        });
    }
  });
}

// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(MAIN, message, nickname, prefix, discord){

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], async function (error, user, fields) {

    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if(!user[0].quests){

      // CREATE THE EMBED
      let no_subscriptions = new MAIN.Discord.MessageEmbed()
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('You do not have any Quest Subscriptions!')
        .setFooter('You can type \'view\', \'time\', or \'add\'.');

      // SEND THE EMBED
      message.channel.send(no_subscriptions).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'remove', message, msg, nickname, prefix, discord);
      });
    } else {
      // RETRIEVE QUEST NAME FROM USER
      let remove_all = false;
      let sub = await sub_collector(MAIN, 'Remove', nickname, message, user[0].quests, 'Names are not case-sensitive.', undefined);
      switch (sub) {
        // CANCEL REMOVAL
        case 'cancel':
          // CREATE THE EMBED
          let cancelled = new MAIN.Discord.MessageEmbed()
            .setAuthor(nickname, message.author.displayAvatarURL)
            .setTitle('Quest Subscription Cancelled')
            .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

          // SEND THE EMBED
          message.channel.send(cancelled).catch(console.error).then( msg => {
            return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
          }); break;

        // REMOVAL TIMED OUT
        case 'time':
          // CREATE THE EMBED
          let timed_out = new MAIN.Discord.MessageEmbed()
            .setAuthor(nickname, message.author.displayAvatarURL)
            .setTitle('Quest Subscription Timed Out')
            .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

          // SEND THE EMBED
          message.channel.send(timed_out).catch(console.error).then( msg => {
            return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
          }); break;

        // REMOVE ALL
        case 'ALL':
          let sub_all = await sub_collector(MAIN, 'Confirm-Remove', nickname, message, user[0].quests, 'Type \'Yes\' or \'No\'', undefined);
          switch (sub_all) {
            case 'cancel':
              // CREATE THE EMBED
              let cancelled = new MAIN.Discord.MessageEmbed()
                .setAuthor(nickname, message.author.displayAvatarURL)
                .setTitle('Quest Subscription Cancelled')
                .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

              // SEND THE EMBED
              message.channel.send(cancelled).catch(console.error).then( msg => {
                return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
              }); break;
            case 'time':
              // CREATE THE EMBED
              let timed_out = new MAIN.Discord.MessageEmbed()
                .setAuthor(nickname, message.author.displayAvatarURL)
                .setTitle('Quest Subscription Timed Out')
                .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

              // SEND THE EMBED
              message.channel.send(timed_out).catch(console.error).then( msg => {
                return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
              }); break;
            default:
              remove_all = true;
          }
        default:
        // DEFINED VARIABLES
        let quests = user[0].quests.split(',');
        let index = quests.indexOf(sub);
        let rewards = MAIN.config.QUEST.Rewards.toString().toLowerCase().split(',');
        let reward_index = rewards.indexOf(sub.toLowerCase());

        if(index < 0 && !remove_all){

          // CREATE THE EMBED
          let no_quest = new MAIN.Discord.MessageEmbed()
            .setAuthor(nickname, message.author.displayAvatarURL)
            .setTitle('You are not Subscribed to that Quest!')
            .setFooter('You can type \'view\', \'time\' \'add\', or \'remove\'.');

          // SEND THE EMBED
          message.channel.send(no_quest).catch(console.error).then( msg => {
            return initiate_collector(MAIN, 'remove', message, msg, nickname, prefix, discord);
          });
        }
        else if(remove_all){ quests = ''; }
        else{ quests.splice(index,1); }

        // CONVERT THE ARRAY TO A STRING
        quests = quests.toString();

        // UPDATE THE USER'S RECORD
        MAIN.pdb.query(`UPDATE users SET quests = ? WHERE user_id = ? AND discord_id = ?`, [quests, message.author.id, discord.id], function (error, user, fields) {
          if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
          else{
            let subscription_success = new MAIN.Discord.MessageEmbed().setColor('00ff00')
              .setAuthor(nickname, message.author.displayAvatarURL)
              .setTitle(sub+' Subscription Removed!')
              .setFooter('Saved to the '+MAIN.config.BOT_NAME+' Database.')
              .setFooter('You can type \'view\', \'time\' \'add\', \'remove\', \'pause\' or \'resume\'.');

            message.channel.send(subscription_success).then( msg => {
              return initiate_collector(MAIN, 'remove', message, msg, nickname, prefix, discord);
            });
          }
        });
      }
    }
  });
}

// SUB COLLECTOR FUNCTION
async function sub_collector(MAIN,type,nickname,message,user_quests,requirements,sub){
  return new Promise( async function(resolve, reject) {

    // DELCARE VARIABLES
    let timeout = true, instruction = '', reward_list = '', user_rewards = [];

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMessage.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, { time: 30000 });

    switch(type){

      // QUEST NAME EMBED
      case 'Name':
        if(user_quests){ user_rewards = user_quests.split(','); }
        else{ user_rewards[0] = 'None';  }
        // CREATE REWARD LIST AND ADD CHECK FOR SUBSCRIBED REWARDS
        await MAIN.config.QUEST.Rewards.forEach((reward,index) => {
          if(user_rewards.indexOf(reward) >= 0){ reward_list += reward+' '+MAIN.emotes.checkYes+'\n'; }
          else{ reward_list += reward+'\n'; }
        });
        await user_rewards.forEach((reward,index) => {
          if(reward_list.indexOf(reward) < 0){ reward_list += reward+' '+MAIN.emotes.checkYes+'\n'; }
        });
        if(!reward_list){ reward_list = user_rewards; }
        instruction = new MAIN.Discord.MessageEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What Quest would you like to Subscribe to?')
          .addField('Available Quest Rewards:', reward_list, false)
          .setFooter(requirements); break;

      // CONFIRM REMOVAL OF ALL REWARDS
      case 'Confirm-Remove':
        instruction = new MAIN.Discord.MessageEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Are you sure you want to Remove ALL of your subscriptions?')
          .setFooter(requirements); break;

      // REMOVAL EMBED
      case 'Remove':
        let sub_list = user_quests.split(',').toString().replace(/,/g,'\n');
        instruction = new MAIN.Discord.MessageEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What Quest do you want to remove?')
          .addField('Your Subscriptions:', '**'+sub_list+'**', false)
          .setFooter(requirements); break;

      // REMOVAL EMBED
      case 'Time':
        instruction = new MAIN.Discord.MessageEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What time do you want to set for Quest DM Alerts?')
          .setDescription('Current Time: `'+user_quests+'`')
          .setFooter(requirements); break;
    }

    message.channel.send(instruction).catch(console.error).then( msg => {

      // DEFINE COLLECTOR AND FILTER
      const filter = cMessage => cMessage.author.id == message.author.id;
      const collector = message.channel.createMessageCollector(filter, { time: 30000 });

      // FILTER COLLECT EVENT
      collector.on('collect', message => {
        switch(true){

          // CANCEL SUB
          case message.content.toLowerCase() == 'cancel': collector.stop('cancel'); break;

          // GET CONFIRMATION
          case type.indexOf('Confirm-Remove')>=0:
          case type.indexOf('Confirm')>=0:
            switch (message.content.toLowerCase()) {
              case 'save':
              case 'yes': collector.stop('yes'); break;
              case 'no':
              case 'cancel': collector.stop('cancel'); break;
              default: message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error);
            } break;

          // QUEST NAME
          case type.indexOf('Name')>=0:
          case type.indexOf('Remove')>=0:
            if(message.content.toLowerCase() == 'all'){ collector.stop('ALL'); break; }
            let search_pokemon = message.content
            let valid_pokemon = MAIN.Pokemon_ID_Search(MAIN, search_pokemon);
            if(valid_pokemon){
              return collector.stop(valid_pokemon.pokemon_name);
            }
            for(let r = 0; r < MAIN.config.QUEST.Rewards.length+1; r++){
              if(r == MAIN.config.QUEST.Rewards.length+1){ message.reply('`'+message.content+'` doesn\'t appear to be a valid Quest reward. Please check the spelling and try again.').then(m => m.delete(5000)).catch(console.error); break; }
              else if(MAIN.config.QUEST.Rewards[r] && message.content.toLowerCase() == MAIN.config.QUEST.Rewards[r].toLowerCase()){
                collector.stop(MAIN.config.QUEST.Rewards[r]); break;
              }
            } break;

          case type.indexOf('Time')>=0:
            if(message.content.length < 6 && message.content.indexOf(':') >= 0){
              let times = message.content.split(':');
              if(parseInt(times[0]) >= 0 && parseInt(times[0]) < 23 && parseInt(times[1]) <= 59 && parseInt(times[1]) >= 0){
                collector.stop(message.content); break;
              }
              else{
                message.reply('`'+message.content+'` doesn\'t appear to be a valid Time. Please check the requirements and try again.').then(m => m.delete(5000)).catch(console.error); break;
              } break;
            }
            else{
              message.reply('`'+message.content+'` doesn\'t appear to be a valid Time. Please check the requirements and try again.').then(m => m.delete(5000)).catch(console.error); break;
            } break;

        }
      });

      // COLLECTOR ENDED
      collector.on('end', (collected,reason) => {
        if(msg){ msg.delete(); }
        resolve(reason);
      });
    });
  });
}

function initiate_collector(MAIN, source, message, msg, nickname, prefix, discord){

  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.author.id == message.author.id;
  const collector = message.channel.createMessageCollector(filter, { time: 60000 });

  // FILTER COLLECT EVENT
  collector.on('collect', message => {
    switch(message.content.toLowerCase()){
      case 'add': collector.stop('add'); break;
      case 'remove': collector.stop('remove'); break;
      case 'view': collector.stop('view'); break;
      case 'pause': collector.stop('pause'); break;
      case 'resume': collector.stop('resume'); break;
      case 'time': collector.stop('settime'); break;
      default: collector.stop('end');
    }
  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', (collected,reason) => {

    // DELETE ORIGINAL MESSAGE
    if(msg){ msg.delete(); }
    switch(reason){
      case 'add': subscription_create(MAIN, message, nickname, prefix, discord); break;
      case 'remove': subscription_remove(MAIN, message, nickname, prefix, discord); break;
      case 'view': subscription_view(MAIN, message, nickname, prefix, discord); break;
      case 'settime': subscription_time(MAIN, message, nickname, prefix, discord); break;
      case 'resume':
      case 'pause': subscription_status(MAIN, message, nickname, reason, prefix, discord); break;
      default:
      if(source == 'start'){
        message.reply('Your subscription has timed out.').then(m => m.delete(5000)).catch(console.error);
      }
    } return;
  });
}
