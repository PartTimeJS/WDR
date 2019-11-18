const Fuzzy = require('fuzzy');
const GeoTz = require('geo-tz');

const moment = require('moment-timezone');
const InsideGeojson = require('point-in-geopolygon');

module.exports.run = async (MAIN, message, prefix, discord) => {

  // LOAD ALL GYMS WITHIN DISCORD GEOFENCE TO AN ARRAY FOR FUZZY
  let available_gyms = [], gym_collection = new MAIN.Discord.Collection();
  await MAIN.gym_array.forEach(async(gym,index) => {
    if(InsideGeojson.polygon(discord.geofence, [gym.lon,gym.lat])){
      let gym_area = await MAIN.Get_Area(MAIN, gym.lat, gym.lon, discord);
      let gym_name = gym.name+' ['+gym_area.area.embed+']';
      available_gyms.push(gym_name); gym_collection.set(gym_name, gym);
    }
  });

  // DECLARE VARIABLES FOR USER
  let address = 'http://localhost:'+MAIN.config.LISTENING_PORT;
  let message_user =  await MAIN.guilds.get(discord.id).members.get(message.author.id);
  let member = {id: message.author.id, displayAvatarURL: message.author.displayAvatarURL};
  if(message.member){
    if(message.member.nickname){ member.nickname = message.member.nickname; } else{ member.nickname = message.author.username; }
  } else{
    member.nickname = message.author.username;
  }

  // DEFINED THE LOBBY OBJECT
  let gym = {}, got_name = false;
  let timezone = GeoTz(discord.geofence[0][1][1], discord.geofence[0][1][0]);



  // RETRIEVE GYM NAME FROM USER
  do {
    if(message.content.split(' ')[1]){
      gym.gym_name = await gym_search(MAIN, message.content.split(' ')[1], discord);
    } else{
      gym.gym_name = await lobby_collector(MAIN, 'Gym', member, message, undefined, 'Respond with a Gym name. Names are not case-sensitive.', gym, available_gyms, discord, gym_collection);
    }
    if(gym.gym_name == 'cancel'){ return lobby_cancel(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }
    else if(gym.gym_name == 'time'){ return lobby_timedout(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }
    else{
      if(!Array.isArray(gym.gym_name) && gym.gym_name.split(',')[0] == 'fuzzy'){
        console.log(gym.gym_name);
        console.log(gym.gym_name.split(',')[1]);
        let results = Fuzzy.filter(gym.gym_name.split(',')[1], available_gyms);
        let matches = results.map(function(el) { return el.string; });
        if(!matches[0]){
          message.reply('`'+gym.gym_name+'`, does not closely match any gym in the database.').then(m => m.delete(5000)).catch(console.error);
        } else{
          let user_choice = await match_collector(MAIN, 'Matches', member, message, matches, 'Type the number of the Correct Gym.', gym, available_gyms, discord, gym_collection);
          if(gym.gym_name == 'cancel'){ return lobby_cancel(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }
          else if(gym.gym_name == 'time'){ return lobby_timedout(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }
          else{
            let collection_match = gym_collection.get(matches[user_choice]);
            if(collection_match){
              gym.gym_id = collection_match.id;
              gym.latitude = collection_match.lat;
              gym.longitude = collection_match.lon;
              gym.gym_name = collection_match.name;

              got_name = true;
            }
          }
        }
      }
      else if(gym.gym_name.length > 1){
        let user_choice = await match_collector(MAIN, 'Multiple', member, message, gym.gym_name, 'Type the number of the Correct Gym.', gym, available_gyms, discord, gym_collection);
        if(gym.gym_name == 'cancel'){ return lobby_cancel(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }
        else if(gym.gym_name == 'time'){ return lobby_timedout(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }
        else if(gym.gym_name[user_choice] == undefined){return;}
        else{
          gym.gym_id = gym.gym_name[user_choice].id;
          gym.latitude = gym.gym_name[user_choice].lat;
          gym.longitude = gym.gym_name[user_choice].lon;
          gym.gym_name = gym.gym_name[user_choice].name;

          got_name = true;
        }
      } else{
        gym.gym_id = gym.gym_name[0].id;
        gym.latitude = gym.gym_name[0].lat;
        gym.longitude = gym.gym_name[0].lon;
        gym.gym_name = gym.gym_name[0].name;

        got_name = true;
      }
    }
  } while(got_name == false);

  // PULL THE USER'S LOBBY FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM active_raids WHERE gym_id = ?`, [gym.gym_id], async function (error, active, fields) {
    // RAID ALREADY IN DB
    if(active && active[0]){
      let active_raid = JSON.parse(active[0].raid);
      MAIN.Send_Hook(MAIN, address, active[0].raid,'raid');
      message.reply('Raid detected, creating Lobby...').then(m => m.delete(8000)).catch(console.error);
      return MAIN.Manual_Lobby(MAIN, active_raid, message, discord, timezone[0]);
    }
    // NO RAID FOR THE SPECIFIED GYM
    else{
      // RETRIEVE BOSS NAME FROM USER
      gym.pokemon = await lobby_collector(MAIN,'Name',member,message, undefined,'Respond with \'All\', \'Egg\' or the Raid Boss\'s name. Names are not case-sensitive.', gym,available_gyms, discord, gym_collection);
      gym.boss = gym.pokemon.pokemon_name ? gym.pokemon.pokemon_name : gym.pokemon.toString();
      gym.form = gym.pokemon.form ? parseInt(gym.pokemon.form) : 0;
      if(gym.boss == 'cancel'){ return lobby_cancel(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }
      else if(gym.boss == 'time'){ return lobby_timedout(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }

      gym.pokemon_id = gym.boss == 'Egg' ? 0 : gym.pokemon.pokemon_id;
      gym.cp = gym.boss == 'Egg' ? 0 : 1;

      // RETRIEVE LEVEL FROM USER
      gym.level = await lobby_collector(MAIN,'Level',member,message, gym,'Please respond with a value of 1 through 5 or type \'All\'. Type \'Cancel\' to Stop.', gym, available_gyms, discord, gym_collection);
      if(gym.level == 'cancel'){ return lobby_cancel(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }
      else if(gym.level == 'time'){ return lobby_timedout(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }

      let time_type = gym.boss == 'Egg' ? 'Hatch Time' : 'Expire Time';
      gym.time = await lobby_collector(MAIN, 'Time', member, message, undefined, 'Respond with \''+time_type+'\'.', gym, available_gyms, discord, gym_collection);
      if(gym.time == 'cancel'){ return lobby_cancel(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }
      else if(gym.time == 'time'){ return lobby_timedout(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }

      let time = gym.time.split(':');
      let unix_time = moment();
      unix_time = moment.tz(unix_time, timezone[0]).set({hour: time[0], minute: time[1], second:0, millisecond:0});
      unix_time = moment.tz(unix_time, MAIN.config.TIMEZONE).format('YYYY-MM-DD HH:mm');

      gym.start = MAIN.Bot_Time(unix_time,'unix',timezone[0]);
      if(time_type == 'Hatch Time'){
        unix_time = moment.tz(unix_time, timezone[0]).add(45, 'm').toDate();
        gym.end = MAIN.Bot_Time(unix_time,'unix',timezone[0]);
      } else{
        gym.end = MAIN.Bot_Time(unix_time,'unix',timezone[0]);
      }

      // RETRIEVE CONFIRMATION FROM USER
      let confirm = await lobby_collector(MAIN, 'Confirm-Add', member, message, undefined, 'Type \'Yes\' or \'No\'. Lobby will be saved.', gym, available_gyms, discord, gym_collection);
      if(confirm == 'cancel'){ return lobby_cancel(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }
      else if(confirm == 'time'){ return lobby_timedout(MAIN, member, message, prefix, available_gyms, discord, gym_collection); }

      gym.move_1 = 0, gym.move_2 = 0, gym.team_id = 0, gym.is_exclusive = false;

      // SEND MANUAL WEBHOOK TO CREATE CHANNEL EMBED
      MAIN.Send_Hook(MAIN, address, JSON.stringify(gym),'raid');

      // MANUALLY CREATE THE LOBBY
      message.reply('Creating Lobby..').then(m => m.delete(8000)).catch(console.error);
      return MAIN.Manual_Lobby(MAIN, gym, message, discord, timezone[0]);
    }
  });
}

// LOBBY COLLECTOR FUNCTION
function lobby_collector(MAIN, type, member, message, object, requirements, gym, available_gyms, discord, gym_collection){
  return new Promise(async function(resolve, reject) {

    // DELCARE VARIABLES
    let timeout = true, instruction = '';

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMessage.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, { time: 30000 });
    switch(type){

      // POKEMON NAME EMBED
      case 'Name':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('What Raid Boss is currently there?')
          .setFooter(requirements); break;

      case 'Gym':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('What Gym do you want to create a lobby for?')
          .setFooter(requirements); break;

      // LEVEL EMBED
      case 'Level':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('What Level is the Raid?')
          .setFooter(requirements); break;

      case 'Time':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('What is the Time for the Raid?')
          .setFooter(requirements); break;

      // CONFIRMATION EMBED
      case 'Confirm-Add':
        let form = '';
        if(gym.pokemon == 'Egg'){ form = ''; }
        else{
          let confirm_locale = await MAIN.Get_Locale(MAIN, {pokemon_id: gym.pokemon.pokemon_id, form: gym.form}, discord);
          if(!gym.form && MAIN.masterfile.pokemon[gym.pokemon.pokemon_id].default_form){
            form = MAIN.masterfile.pokemon[gym.pokemon.pokemon_id].forms[MAIN.masterfile.pokemon[gym.pokemon.pokemon_id].default_form].name;
          } else{ form = confirm_locale.form; }
        }

        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('Does all of this look correct?')
          .setDescription('**Gym**: `'+gym.gym_name
                      +'`\n**Boss**: `'+gym.boss+' '+form
                      +'`\n**Level**: `'+gym.level
                      +'`\n**Time**: `'+gym.time+'`')
          .setFooter(requirements); break;
    }

    message.channel.send(instruction).catch(console.error).then( msg => {

      // DEFINED VARIABLES
      let input = '';

      // FILTER COLLECT EVENT
      collector.on('collect', async message => {
        message.delete();
        switch(true){

          // CANCEL LOBBY
          case message.content.toLowerCase() == 'stop':
          case message.content.toLowerCase() == 'cancel': collector.stop('cancel'); break;

          // GYM NAME
          case type.indexOf('Gym') >= 0:
            let searched = await gym_search(MAIN, message.content, discord);
            collector.stop(searched);
            break;

          // POKEMON NAME
          case type.indexOf('Name') >= 0:
            switch(message.content.toLowerCase()){
              case 'all': collector.stop('All'); break;
              case 'egg': collector.stop('Egg'); break;
              default:
                let search_pokemon = message.content.split('-')
                let valid_pokemon = MAIN.Pokemon_ID_Search(MAIN, search_pokemon[0]);
                if(valid_pokemon){
                  if(search_pokemon[1]){
                    valid_pokemon.pokemon_name = valid_pokemon.pokemon_name+'-'+search_pokemon[1];
                  }
                  return collector.stop(valid_pokemon);
                } else {
                  return message.reply('`'+message.content+'` doesn\'t appear to be a valid Raid Boss name. Please check the spelling and try again.').then(m => m.delete(5000)).catch(console.error);
                }
            } break;

          // LEVEL CONFIGURATION
          case type.indexOf('Level') >= 0:
            if(parseInt(message.content) >= 1 && parseInt(message.content) <= 5){ collector.stop(parseInt(message.content)); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

          // TIME CONFIGURATION
          case type.indexOf('Time') >= 0:
            if(message.content.length < 6 && message.content.indexOf(':') >= 0){
              let times = message.content.split(':');
              if(parseInt(times[0]) >= 0 && parseInt(times[0]) < 23 && parseInt(times[1]) <= 59 && parseInt(times[1]) >= 0){
                collector.stop(message.content); break;
              } else{
                message.reply('`'+message.content+'` doesn\'t appear to be a valid Time. '+requirements).then(m => m.delete(5000)).catch(console.error); break;
              } break;
            } else{
              message.reply('`'+message.content+'` doesn\'t appear to be a valid Time. '+requirements).then(m => m.delete(5000)).catch(console.error); break;
            } break;

          case type.indexOf('Confirm-Add') >= 0:
            switch (message.content.toLowerCase()) {
              case 'save':
              case 'yes': collector.stop('yes'); break;
              case 'no':
              case 'cancel': collector.stop('cancel'); break;
              default: message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error);
            } break;
        }
      });

      // COLLECTOR ENDED
      collector.on('end', (collected,reason) => {
        if(msg){ msg.delete(); }
        return resolve(reason);
      });
    });
  });
}

function gym_search(MAIN, search, discord){
  return new Promise(async function(resolve, reject) {
    MAIN.rdmdb.query(`SELECT * FROM gym WHERE name = ?`, [search], async function (error, gyms, fields) {
      if(!gyms){ return resolve('fuzzy,'+search); }
      else{
        await gyms.forEach((gym,index) => {
          if(!InsideGeojson.polygon(discord.geofence, [gym.lon,gym.lat])){ gyms.splice(index,1); }
        });
        if(gyms[0]){ return resolve(gyms); }
        else{ return resolve('fuzzy,'+search); }
      }
    });
  });
}

function lobby_cancel(MAIN, member, message, prefix, available_gyms, discord, gym_collection){
  let lobby_cancel = new MAIN.Discord.RichEmbed().setColor('00ff00')
    .setAuthor(member.nickname, member.displayAvatarURL)
    .setTitle('Lobby Cancelled.')
    .setDescription('Nothing has been created.');
  message.channel.send(lobby_cancel).then(m => m.delete(5000)).catch(console.error);
}

function lobby_timedout(MAIN, member, message, prefix, available_gyms, discord, gym_collection){
  let lobby_cancel = new MAIN.Discord.RichEmbed().setColor('00ff00')
    .setAuthor(member.nickname, member.displayAvatarURL)
    .setTitle('Lobby Timed Out.')
    .setDescription('Nothing has been created.');
  message.channel.send(lobby_cancel).then(m => m.delete(5000)).catch(console.error);
}

async function match_collector(MAIN, type, member, message, object, requirements, gym, available_gyms, discord, gym_collection){
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
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('Possible matches for \''+gym.gym_name.split(',')[1]+'\' were found.')
          .setDescription(match_desc)
          .setFooter('Type the number of the gym you wish to select or type \'cancel\'.'); break;

      // REMOVAL EMBED
      case 'Multiple':
        let description = '';
        await MAIN.asyncForEach(object, async (match,index) => {
          let match_area = await MAIN.Get_Area(MAIN, match.lat, match.lon, discord);
          let match_name = match.name+' ['+match_area.area.embed+']';
          description += (index+1)+'. '+match_name+'\n';
        })
        if(description.length > 2048){
          description = description.slice(0,1973)+'**\nThere are too many to display. Try to narrow your search terms.**';
        }
        options = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('Multiple Matches were found.').setDescription(description)
          .setFooter('Type the number of the gym you wish to select or type \'cancel\'.'); break;
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
