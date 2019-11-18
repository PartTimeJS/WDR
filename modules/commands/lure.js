const Fuzzy = require('fuzzy');

const InsideGeojson = require('point-in-geopolygon');

module.exports.run = async (MAIN, message, prefix, discord) => {

  // LOAD ALL STOPS WITHIN DISCORD GEOFENCE TO AN ARRAY FOR FUZZY
  let available_stops = [], stop_collection = new MAIN.Discord.Collection();
  await MAIN.stop_array.forEach(async(stop,index) => {
    if(InsideGeojson.polygon(discord.geofence, [stop.lon,stop.lat])){
      let stop_area = await MAIN.Get_Area(MAIN, stop.lat, stop.lon, discord);
      let stop_name = stop.name+' ['+stop_area.area.embed+']';
      available_stops.push(stop_name); stop_collection.set(stop_name, stop);
    }
  });

  // GET USER NICKNAME
  let nickname = '';
  if(message.member){
    if(message.member.nickname){ nickname = message.member.nickname; } else{ nickname = message.member.user.username; }
  } else{
    nickname = message.author.username;
  }

  let request_action = new MAIN.Discord.RichEmbed()
    .setAuthor(nickname, message.author.displayAvatarURL)
    .setTitle('What would you like to do with your Lure Subscriptions?')
    .setDescription('`view`  »  View your Subscritions.\n'
                   +'`add`  »  Create a Simple Subscription.\n'
                   +'`remove`  »  Remove a Lure Subscription.\n'
                   +'`pause` or `resume`  »  Pause/Resume Lure Subscriptions Only.')
    .setFooter('Type the action, no command prefix required.');

  message.channel.send(request_action).catch(console.error).then( msg => {
      return initiate_collector(MAIN, 'start', message, msg, nickname, prefix, available_stops, discord, stop_collection);
  });
}

// PAUSE OR RESUME POKEMON SUBSCRIPTIOONS
function subscription_status(MAIN, message, nickname, reason, prefix, available_stops, discord, stop_collection){
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], function (error, user, fields) {
    if(user[0].lure_status == 'ACTIVE' && reason == 'resume'){
      let already_active = new MAIN.Discord.RichEmbed().setColor('ff0000')
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('Your lure subscriptions are already **Active**!')
        .setFooter('You can type \'view\', \'add\', or \'remove\'.');

      // SEND THE EMBED
      message.channel.send(already_paused).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, available_stops, discord, stop_collection);
      });
    }
    else if(user[0].lure_status == 'PAUSED' && reason == 'pause'){
      let already_paused = new MAIN.Discord.RichEmbed().setColor('ff0000')
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('Your lure subscriptions are already **Paused**!')
        .setFooter('You can type \'view\', \'add\', or \'remove\'.');

      // SEND THE EMBED
      message.channel.send(already_paused).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, available_stops, discord, stop_collection);
      });
    }
    else{
      if(reason == 'pause'){ change = 'PAUSED'; }
      if(reason == 'resume'){ change = 'ACTIVE'; }
      MAIN.pdb.query('UPDATE users SET lure_status = ? WHERE user_id = ? AND discord_id = ?', [change, message.author.id, discord.id], function (error, user, fields) {
        if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
        else{
          let subscription_success = new MAIN.Discord.RichEmbed().setColor('00ff00')
            .setAuthor(nickname, message.author.displayAvatarURL)
            .setTitle('Your lure subscriptions have been set to `'+change+'`!')
            .setFooter('Saved to the '+MAIN.config.BOT_NAME+' Database.');
          return message.channel.send(subscription_success).then(m => m.delete(5000)).catch(console.error);
        }
      });
    }
  });
}

// SUBSCRIPTION REMOVE FUNCTION
async function subscription_view(MAIN, message, nickname, prefix, available_stops, discord, stop_collection){
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], function (error, user, fields) {

    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if(!user[0].lure){
      let no_subscriptions = new MAIN.Discord.RichEmbed().setColor('00ff00')
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('You do not have any Lure Subscriptions!')
        .setFooter('You can type \'view\', \'add\', or \'remove\'.');

      // SEND THE EMBED
      message.channel.send(no_subscriptions).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, available_stops, discord, stop_collection);
      });
    }
    else{

      let lure = JSON.parse(user[0].lure), lure_levels = '';
      if(!lure.subscriptions[0]){

        // CREATE THE EMBED AND SEND
        let no_subscriptions = new MAIN.Discord.RichEmbed().setColor('00ff00')
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('You do not have any Subscriptions!')
          .setFooter('You can type \'view\', \'add\', or \'remove\'.');
        message.channel.send(no_subscriptions).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, available_stops, discord, stop_collection);
        });
      }
      else{

        // CREATE THE EMBED
        let lure_subs = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Lure Subscriptions')
          .setDescription('Overall Status: `'+user[0].status+'`\nlures Status: `'+user[0].lure_status+'`')
          .setFooter('You can type \'view\', \'add\', or \'remove\'.');

        // TURN EACH SUBSCRIPTION INTO A FIELD
        lure.subscriptions.forEach((sub,index) => {
          if(sub.stop != 'All' && sub.type != 'All'){
            title = '#'+(index+1)+' '+sub.type;
            body = 'Stop: '+sub.stop+'\nFiltered by Areas: `'+sub.areas+'`';
          }
          else{
             title = '#'+(index+1);
             body = 'Stop: `'+sub.stop+'`\nlure : `'+sub.type+'`\nFiltered by Areas: `'+sub.areas+'`';
          }

          lure_subs.addField(title, body, false);
        });

        // SEND THE EMBED
        message.channel.send(lure_subs).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, available_stops, discord, stop_collection);
        });
      }
    }
  });
}

// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(MAIN, message, nickname, prefix, advanced, available_stops, discord, stop_collection){

  // DEFINED THE SUBSCRIPTION OBJECT
  let sub = {}, got_name = false;

  // RETRIEVE STOP NAME FROM USER
  do {
    sub.stop = await sub_collector(MAIN, 'Stop', nickname, message, undefined, 'Respond with \'All\'  or a Stop name. Names are not case-sensitive.', sub, available_stops, discord, stop_collection);
    if(sub.stop == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
    else if(sub.stop == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
    else{
      if(sub.stop == 'All'){ sub.stop = 'All'; got_name = true; }
      else if(!Array.isArray(sub.stop) && sub.stop.split(',')[0] == 'fuzzy'){
        console.log(sub.stop);
        console.log(sub.stop.split(',')[1]);
        let results = Fuzzy.filter(sub.stop.split(',')[1], available_stops);
        let matches = results.map(function(el) { return el.string; });
        if(!matches[0]){
          message.reply('`'+sub.stop+'`, does not closely match any stop in the database.').then(m => m.delete(5000)).catch(console.error);
        } else{
          let user_choice = await match_collector(MAIN, 'Matches', nickname, message, matches, 'Type the number of the Correct stop.', sub, available_stops, discord, stop_collection);
          if(sub.stop == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
          else if(sub.stop == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
          else{
            let collection_match = stop_collection.get(matches[user_choice]);
            if(collection_match){
              sub.id = collection_match.id;
              sub.stop = collection_match.name;
              got_name = true;
            }
          }
        }
      }
      else if(sub.stop.length > 1){
        let user_choice = await match_collector(MAIN, 'Multiple', nickname, message, sub.stop, 'Type the number of the Correct Stop.', sub, available_stops, discord, stop_collection);
        if(sub.stop == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
        else if(sub.stop == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
        else{
          sub.id = sub.stop[user_choice].id;
          sub.stop = sub.stop[user_choice].name;
          got_name = true;
        }
      } else{
        sub.id = sub.stop[0].id;
        sub.stop = sub.stop[0].name;
        got_name = true;
      }
    }
  } while(got_name == false);

  // RETRIEVE LURE TYPE FROM USER
  sub.type = await sub_collector(MAIN,'Type',nickname,message, undefined,'Respond with \'All\'  or the Lure Type. Names are not case-sensitive.', sub,available_stops, discord, stop_collection);
  if(sub.type == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
  else if(sub.type == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }

  // RETRIEVE AREA CONFIRMATION FROM USER IF NOT FOR A SPECIFIC STOP
  if(sub.stop == 'All'){
    sub.areas = await sub_collector(MAIN, 'Area Filter', nickname, message, sub.type, 'Please respond with \'Yes\' or \'No\'', sub, available_stops, discord, stop_collection);
    if(sub.areas == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
    else if(sub.areas == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
  }
  else{ sub.areas = 'Stop Specified'; }

  // RETRIEVE CONFIRMATION FROM USER
  let confirm = await sub_collector(MAIN, 'Confirm-Add', nickname, message, sub.type, 'Type \'Yes\' or \'No\'. Subscription will be saved.', sub, available_stops, discord, stop_collection);
  if(confirm == 'Cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
  else if(confirm == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], async function (error, user, fields) {
    let lure = '';
    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if(!user[0].lure){
      lure = {};
      lure.subscriptions = [];
      lure.subscriptions.push(sub);
    } else{
      lure = JSON.parse(user[0].lure);
      if(!lure.subscriptions[0]){ lure.subscriptions.push(sub); }
      else{
        // CONVERT TO OBJECT AND CHECK EACH SUBSCRIPTION
        lure = JSON.parse(user[0].lure);
        lure.subscriptions.forEach((subscription,index) => {

          // ADD OR OVERWRITE IF EXISTING
          if(subscription.encounter == sub.type && subscription.stop == sub.stop){
            lure.subscriptions[index] = sub;
          }
          else if(index == lure.subscriptions.length-1){ lure.subscriptions.push(sub); }
        });
      }
    }

    // STRINGIFY THE OBJECT
    let new_subs = JSON.stringify(lure);

    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET lure = ? WHERE user_id = ? AND discord_id = ?`, [new_subs, message.author.id, discord.id], function (error, user, fields) {
      if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
      else{
        let subscription_success = new MAIN.Discord.RichEmbed().setColor('00ff00')
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle(sub.type+' Lure Subscription Complete!')
          .setDescription('Saved to the '+MAIN.config.BOT_NAME+' Database.')
          .setFooter('You can type \'view\', \'add\', or \'remove\'.');
        message.channel.send(subscription_success).then( msg => {
          return initiate_collector(MAIN, 'create', message, msg, nickname, prefix, available_stops, discord, stop_collection);
        });
      }
    });
  });
}

// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(MAIN, message, nickname, prefix, available_stops, discord, stop_collection){

  // FETCH USER FROM THE USERS TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], async function (error, user, fields) {

    // END IF USER HAS NO SUBSCRIPTIONS
    if(!user[0].lure){

      // CREATE THE RESPONSE EMBED
      let no_subscriptions = new MAIN.Discord.RichEmbed().setColor('00ff00')
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('You do not have any Lure Subscriptions!')
        .setFooter('You can type \'view\', \'add\', or \'remove\'.');

      // SEND THE EMBED
      message.channel.send(no_subscriptions).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, available_stops, discord, stop_collection);
      });
    }
    else {

      // PARSE THE STRING TO AN OBJECT
      let lure = JSON.parse(user[0].lure), found = false, embed_title = '';

      // FETCH NAME OF POKEMON TO BE REMOVED AND CHECK RETURNED STRING
      let remove_id = await sub_collector(MAIN,'Remove',nickname,message,lure,'Type the Number of the Subscription you want to remove.', undefined);

      switch(remove_id.toLowerCase()){
        case 'time': return subscription_cancel(MAIN, nickname, message, prefix, available_stops, discord, stop_collection);
        case 'cancel': return subscription_timedout(MAIN, nickname, message, prefix, available_stops, discord, stop_collection);
        case 'all':

          // CONFIRM THEY REALL MEANT TO REMOVE ALL
          let confirm = await sub_collector(MAIN, 'Confirm-Remove', nickname, message, remove_id, 'Type \'Yes\' or \'No\'. Subscription will be saved.', undefined);
          if(confirm == 'Cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }
          else if(confirm == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, available_stops, discord, stop_collection); }

          // MARK AS FOUND AND WIPE THE ARRAY
          lure.subscriptions = []; break;
          embed_title = 'All Subscriptions Removed!';

        default:
          // REMOVE THE SUBSCRIPTION
          lure.subscriptions.splice((remove_id-1),1);
          embed_title = 'Subscription #'+remove_id+' Removed!'
      }

      // STRINGIFY THE OBJECT
      let new_subs = JSON.stringify(lure);

      // UPDATE THE USER'S RECORD
      MAIN.pdb.query(`UPDATE users SET lure = ? WHERE user_id = ? AND discord_id = ?`, [new_subs, message.author.id, discord.id], function (error, user, fields) {
        if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
        else{
          let subscription_success = new MAIN.Discord.RichEmbed().setColor('00ff00')
            .setAuthor(nickname, message.author.displayAvatarURL)
            .setTitle(embed_title)
            .setDescription('Saved to the '+MAIN.config.BOT_NAME+' Database.')
            .setFooter('You can type \'view\', \'add\', or \'remove\'.');
          return message.channel.send(subscription_success).then( msg => {
            return initiate_collector(MAIN, 'remove', message, msg, nickname, prefix, available_stops, discord, stop_collection);
          });
        }
      });
    }
  });
}

// SUB COLLECTOR FUNCTION
function sub_collector(MAIN, type, nickname, message, object, requirements, sub, available_stops, discord, stop_collection){
  return new Promise(function(resolve, reject) {

    // DELCARE VARIABLES
    let timeout = true, instruction = '';

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMessage.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, { time: 30000 });

    switch(type){

      // POKEMON NAME EMBED
      case 'Type':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What Lure Type would you like to Subscribe to?')
          .setFooter(requirements); break;

      // Stop NAME EMBED
      case 'Stop':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What Stop would you like to Subscribe to?')
          .setFooter(requirements); break;

      // CONFIRMATION EMBED
      case 'Confirm-Add':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Does all of this look correct?\nStop: `'+sub.stop+'`\nLure Type: `'+sub.type+'`\nFilter By Areas: `'+sub.areas+'`')
          .setFooter(requirements); break;

      case 'Confirm-Remove':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Are you sure you want to Remove ALL of your subscriptions?')
          .setFooter(requirements); break;

      // REMOVAL EMBED
      case 'Remove':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Which lure Subscription do you want to remove?')
          .setFooter(requirements);

        // TURN EACH SUBSCRIPTION INTO A FIELD
        object.subscriptions.forEach((lure,index) => {
          instruction.addField('#'+(index+1), 'lure: `'+lure.stop+'`\nLure Type: `'+lure.type+'`\nFiltered by Areas: '+lure.areas, false);
        }); break;

      // AREA EMBED
      case 'Area Filter':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Do you want to get notifications for '+object+' lures filtered by your subscribed Areas?')
          .setDescription('If you choose **Yes**, your notifications for this Lure Type will be filtered based on your areas. If you choose **No**, you will get notifications for this lure in ALL areas for the city.')
          .setFooter(requirements); break;

      // DEFAULT EMBED
      default:
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What **'+type+'** would like you like to set for **'+object+'** lure Notifications?')
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

          // Stop NAME
          case type.indexOf('Stop') >= 0:
            if(message.content.toLowerCase() == 'all'){ collector.stop('All'); }
            else{
              MAIN.rdmdb.query(`SELECT * FROM pokestop WHERE name = ?`, [message.content], async function (error, stops, fields) {
                if(!stops){ return collector.stop('fuzzy,'+message.content); }
                else{
                  await stops.forEach((stop,index) => {
                    if(!InsideGeojson.polygon(discord.geofence, [stop.lon,stop.lat])){ stops.splice(index,1); }
                  });
                  if(stops[0]){ return collector.stop(stops); }
                  else{ return collector.stop('fuzzy,'+message.content); }
                }
              });
            } break;

          case type.indexOf('Area Filter') >= 0:
            switch (message.content.toLowerCase()) {
              case 'yes': collector.stop('Yes'); break;
              case 'all':
              case 'no': collector.stop('No'); break;
              default: message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error);
            } break;

          case type.indexOf('Confirm-Add') >= 0:
          case type.indexOf('Confirm-Remove') >= 0:
            switch (message.content.toLowerCase()) {
              case 'save':
              case 'yes': collector.stop('Yes'); break;
              case 'no':
              case 'cancel': collector.stop('Cancel'); break;
              default: message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error);
            } break;

          // POKEMON NAME
          case type.indexOf('Type') >= 0:
            switch(message.content.toLowerCase()){
              case 'all': collector.stop('All'); break;
              case 'normal': collector.stop('Normal'); break;
              case 'glacial': collector.stop('Glacial'); break;
              case 'mossy': collector.stop('Mossy'); break;
              case 'magnetic': collector.stop('Magnetic'); break;
              default: message.reply('`'+message.content+'` doesn\'t appear to be a valid Lure Type. Please check the spelling and try again.').then(m => m.delete(5000)).catch(console.error);
            } break;

          // SUBSCRIPTION NUMBER
          case type.indexOf('Remove') >= 0:
            if(message.content > 0 && message.content <= object.subscriptions.length){ collector.stop(message.content); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

          // MIN/MAX LEVEL CONFIGURATION
          case type.indexOf('Level') >= 0:
            if(parseInt(message.content) >= 1 && parseInt(message.content) <= 5){ collector.stop(message.content); }
            else if(message.content.toLowerCase() == 'all'){ collector.stop('All'); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;
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

function subscription_cancel(MAIN, nickname, message, prefix, available_stops, discord, stop_collection){
  let subscription_cancel = new MAIN.Discord.RichEmbed().setColor('00ff00')
    .setAuthor(nickname, message.author.displayAvatarURL)
    .setTitle('Subscription Cancelled.')
    .setDescription('Nothing has been Saved.')
    .setFooter('You can type \'view\', \'add\', or \'remove\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'cancel', message, msg, nickname, prefix, available_stops, discord, stop_collection);
  });
}

function subscription_timedout(MAIN, nickname, message, prefix, available_stops, discord, stop_collection){
  let subscription_cancel = new MAIN.Discord.RichEmbed().setColor('00ff00')
    .setAuthor(nickname, message.author.displayAvatarURL)
    .setTitle('Subscription Timed Out.')
    .setDescription('Nothing has been Saved.')
    .setFooter('You can type \'view\', \'add\', or \'remove\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'time', message, msg, nickname, prefix, available_stops, discord, stop_collection);
  });
}

function initiate_collector(MAIN, source, message, msg, nickname, prefix, available_stops, discord, stop_collection){
  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.author.id == message.author.id;
  const collector = message.channel.createMessageCollector(filter, { time: 60000 });

  // FILTER COLLECT EVENT
  collector.on('collect', message => {
    switch(message.content.toLowerCase()){
      case 'advanced':
      case 'add advanced':
      case 'add': collector.stop('add'); break;
      case 'remove': collector.stop('remove'); break;
      case 'view': collector.stop('view'); break;
      case 'pause': collector.stop('pause'); break;
      case 'resume': collector.stop('resume'); break;
      default: collector.stop('end');
    }
  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', (collected,reason) => {

    // DELETE ORIGINAL MESSAGE
    msg.delete();
    switch(reason){
      case 'cancel': resolve('cancel'); break;
      case 'add': subscription_create(MAIN, message, nickname, prefix, false, available_stops, discord, stop_collection); break;
      case 'remove': subscription_remove(MAIN, message, nickname, prefix, available_stops, discord, stop_collection); break;
      case 'view': subscription_view(MAIN, message, nickname, prefix, available_stops, discord, stop_collection); break;
      case 'resume':
      case 'pause': subscription_status(MAIN, message, nickname, reason, prefix, available_stops, discord, stop_collection); break;
      default:
        if(source == 'start'){
          message.reply('Your subscription has timed out.').then(m => m.delete(5000)).catch(console.error);
        }
    } return;
  });
}

async function match_collector(MAIN, type, nickname, message, object, requirements, sub, available_stops, discord, stop_collection){
  return new Promise(async function(resolve, reject) {
    let options = '';
    switch(type){

      // REMOVAL EMBED
      case 'Matches':
        let match_desc = '';
        object.forEach((match,index) => {
          match_desc += (index+1)+'. '+match+'\n';
        });
        if(match_desc.length > 2048){
          match_desc = match_desc.slice(0,1973)+'**\nThere are too many to display. Try to narrow your search terms.**';
        }
        options = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Possible matches for \''+sub.stop.split(',')[1]+'\' were found.')
          .setDescription(match_desc)
          .setFooter('Type the number of the stop you wish to select or type \'cancel\'.'); break;

      // REMOVAL EMBED
      case 'Multiple':
        let description = '';
        await MAIN.asyncForEach(object, async (match,index) => {
          let match_area = await MAIN.Get_Area(MAIN, match.lat, match.lon, discord);
          let match_name = match.name+' ['+match_area.area.embed+']';
          description += (index+1)+'. '+match_name+'\n';
        })
        options = new MAIN.Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Multiple Matches were found.').setDescription(description)
          .setFooter('Type the number of the stop you wish to select or type \'cancel\'.'); break;
    }

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMessage.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, { time: 30000 });

    message.channel.send(options).catch(console.error).then( msg => {

      // FILTER COLLECT EVENT
      collector.on('collect', message => {
        if(parseInt(message.content) >= 1 && parseInt(message.content) <= object.length){
          collector.stop(parseInt(message.content)-1);
        }
        else if(message.content.toLowerCase() == 'cancel'){ collector.stop('cancel'); }
        else{ message.reply('`'+message.content+'` is not a valid selection.').then(m => m.delete(5000)).catch(console.error); }
      });

      collector.on('end', (collected,reason) => {
        msg.delete();
        return resolve(reason);
      });
    });
  });
}
