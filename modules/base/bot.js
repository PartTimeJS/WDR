//------------------------------------------------------------------------------
//  MODULE REQUIREMENTS
//------------------------------------------------------------------------------
const InsideGeojson = require('point-in-geopolygon');
const { exec } = require("child_process");
const moment = require('moment-timezone');
const Discord = require('discord.js');
const MySQL = require('mysql');
const Ontime = require('ontime');
const GeoTz = require('geo-tz');
const ini = require('ini');
const fs = require('fs');
const pvp = require('./pvp.js');
//------------------------------------------------------------------------------
//  INITIATE BOTS AND DISABLE UNNECESSARY EVENTS
//------------------------------------------------------------------------------
const botOptions = {
  disabledEvents: [ "PRESENCE_UPDATE", "VOICE_STATE_UPDATE", "TYPING_START", "VOICE_SERVER_UPDATE" ],
  messageCacheMaxSize: 5,
  messageCacheLifetime: 120,
  messageSweepInterval: 60
};
const MAIN = new Discord.Client(botOptions);
const ALPHA = new Discord.Client(botOptions);
const BRAVO = new Discord.Client(botOptions);
const CHARLIE = new Discord.Client(botOptions);
const DELTA = new Discord.Client(botOptions);
const ECHO = new Discord.Client(botOptions);
const FOXTROT = new Discord.Client(botOptions);
const GULF = new Discord.Client(botOptions);
const HOTEL = new Discord.Client(botOptions);
const INDIA = new Discord.Client(botOptions);
const JULIET = new Discord.Client(botOptions);
const KILO = new Discord.Client(botOptions);
const LIMA = new Discord.Client(botOptions);
const MIKE = new Discord.Client(botOptions);
const NOVEMBER = new Discord.Client(botOptions);
const OSCAR = new Discord.Client(botOptions);
//------------------------------------------------------------------------------
//  INITIAL LOAD OF CONFIG AND DISCORDS
//------------------------------------------------------------------------------
MAIN.config = ini.parse(fs.readFileSync('./config/config.ini', 'utf-8'));
MAIN.Discords = require('../../config/discords.json');
MAIN.Discord = require('discord.js');
MAIN.jsonEncode = require('form-urlencoded').default;
//------------------------------------------------------------------------------
//  TIME FUNCTION
//------------------------------------------------------------------------------
MAIN.Bot_Time = (time,type,timezone) => {
  switch(type){
    case '1': return moment.unix(time).tz(timezone).format('h:mm A');
    case '2': return moment().tz(timezone).format('HHmm');
    case '3': return moment(time).tz(timezone).format('HHmm');
    case 'quest': return moment().tz(timezone).format('dddd, MMMM Do')+' @ Midnight';
    case 'stamp': return moment().format('HH:mmA');
    case 'nest': return moment.unix(time).tz(timezone).format('MMM Do YYYY hA')
    case 'unix': return moment(time).tz(timezone).format('X');
  }
}
//------------------------------------------------------------------------------
//  GLOBAL VARIABLES, LOGGING, & DEBUGGING
//------------------------------------------------------------------------------
MAIN.BOTS = []; MAIN.debug = MAIN.config.DEBUG;
MAIN.logging = MAIN.config.CONSOLE_LOGS;
var Emojis, Commands;
//------------------------------------------------------------------------------
//  INITIATE COMMAND LISTENER ONLY ONCE FOR MAIN PROCESS
//------------------------------------------------------------------------------
if(process.env.fork == 0){
  delete require.cache[require.resolve('../filtering/commands.js')];
  Commands = require('../filtering/commands.js');
  // LOAD COMMANDS
  MAIN.Commands = new Discord.Collection();
  fs.readdir('./modules/commands', (err,files) => {
    let command_files = files.filter(f => f.split('.').pop()==='js'), command_count = 0;
    command_files.forEach((f,i) => {
      delete require.cache[require.resolve('../commands/'+f)]; command_count++;
      let command = require('../commands/'+f); MAIN.Commands.set(f.slice(0,-3), command);
    });
  });
  // COMMAND MESSAGE LISTENER
  MAIN.on('message', message => {
    return Commands.run(MAIN, MAIN, message);
  });

  // SET ONTIME FUNCTIONS
  var ontime_servers = [], ontime_times = [];
  MAIN.Discords.Servers.forEach( function(server){
    let server_purge = moment(), timezone = GeoTz(server.geofence[0][0][1], server.geofence[0][0][0]);
    server_purge = moment.tz(server_purge, timezone[0]).set({hour:23,minute:50,second:0,millisecond:0});
    server_purge = moment.tz(server_purge, MAIN.config.TIMEZONE).format('HH:mm:ss');
    ontime_times.push(server_purge);
    ontime_servers.push(server);
  });
  // GET CHANNELS FOR PURGING
  MAIN.Purge_Channels = (command) => {
    let now = moment().format('HH:mm')+':00';
    ontime_servers.forEach(function(server){
      if(server.purge_channels == 'ENABLED'){
        let purge_time = moment(), timezone = GeoTz(server.geofence[0][1][1], server.geofence[0][1][0]);
        purge_time = moment.tz(purge_time, timezone[0]).set({hour:23,minute:50,second:0,millisecond:0});
        purge_time = moment.tz(purge_time, MAIN.config.TIMEZONE).format('HH:mm:ss');
        if(now == purge_time || command == 'purge'){
          for(var i = 0; i < server.channels_to_purge.length; i++){ clear_channel(server.channels_to_purge[i]); }
        }
      }
    }); return;
  }
  // PURGE CHANNEL
  function clear_channel(channel_id){
    return new Promise( async function(resolve) {
      let channel = await MAIN.channels.cache.get(channel_id);
      if(!channel) { resolve(false); return console.error('['+MAIN.Bot_Time(null,'stamp')+'] [Ontime] Could not find a channel with ID: '+channel_id); }
      channel.fetchMessages({limit:99}).then(messages => {
        channel.bulkDelete(messages).then(deleted => {
          if(messages.size > 0){ clear_channel(channel_id).then(result => { return resolve(true); }); }
          else{
            console.log('[Ontime] ['+MAIN.Bot_Time(null,'stamp')+'] Purged all messages in '+channel.name+' ('+channel.id+')');
            return resolve(true);
          }
        }).catch(console.error);
      });
    });
  }
  // CHANNEL PURGING
  Ontime({ cycle: ontime_times }, function(ot) { MAIN.Purge_Channels(); return ot.done(); });
  // CHECK DATABASE FOR UPGRADED OR REMOVED POKESTOPS
  let check_time = moment();

  // QUERY TO CLEAR QUESTS
  Ontime({ cycle: "00:00:00" }, async function(ot) {
    // FORCE CLEAR QUESTS
    if(MAIN.config.rdmDB.Clear_Quests == 'ENABLED'){
      MAIN.rdmdb.query('UPDATE pokestop SET quest_type = NULL, quest_target = NULL, quest_rewards = NULL, quest_template = NULL, quest_timestamp = NULL, quest_conditions = NULL;', function (error, record, fields) {
        if(error){ console.error(error); }
      }); console.log('[Ontime] ['+MAIN.Bot_Time(null,'stamp')+'] Ran Query to Clear Quests.');
    }

    // TRIM POKEMON SIGHTINGS TABLE
    if(MAIN.config.rdmDB.Trim_Pokemon_Table == 'ENABLED'){
      let prune_time = parseInt(MAIN.config.rdmDB.Trim_Days)*86400;
      MAIN.rdmdb.query('DELETE FROM pokemon WHERE updated < UNIX_TIMESTAMP()-'+prune_time, function (error, record, fields) {
        if(error){ console.error(error); }
      }); console.log('[Ontime] ['+MAIN.Bot_Time(null,'stamp')+'] Ran Query to trim Pokemon table.');
    }
  });
  check_time = moment.tz(check_time, 'America/Los_Angeles').set({hour:23,minute:40,second:0,millisecond:0}).format('HH:mm:ss');
  Ontime({ cycle: check_time }, async function(ot) {
    if(MAIN.config.rdmDB.Remove_Upgraded_Pokestops == 'ENABLED'){
      // UPDATE NAMES FOR ANY POSSIBLE NEW GYMS
      await MAIN.rdmdb.query('UPDATE gym INNER JOIN pokestop ON gym.id = pokestop.id SET gym.name = pokestop.name, gym.url = pokestop.url WHERE gym.id = pokestop.id', function (error, record, fields) {
        if(error){ console.error(error); }
      });
      // DELETE ANY POKESTOPS THAT HAVE BEEN UPGRADED TO GYMS
      MAIN.rdmdb.query('DELETE FROM pokestop WHERE id IN (SELECT id FROM gym)', function (error, record, fields) {
        if(error){ console.error(error); }
      }); console.log('[Ontime] ['+MAIN.Bot_Time(null,'stamp')+'] Ran Query to remove Upgraded Pokestops.');
    }
    // QUERY TO REMOVE UNSEEN POKESTOPS
    if(MAIN.config.rdmDB.Remove_Unseen_Pokestops == 'ENABLED'){
      MAIN.rdmdb.query('DELETE FROM pokestop WHERE updated < UNIX_TIMESTAMP()-90000', function (error, record, fields) {
        if(error){ console.error(error); }
      }); console.log('[Ontime] ['+MAIN.Bot_Time(null,'stamp')+'] Ran Query to remove Stale Pokestops.');
    }
    if(MAIN.config.rdmDB.Update_Gyms && MAIN.config.rdmDB.Update_Gyms == 'ENABLED'){
      exec('python ingress_scraper/scrape_portal.py -g -c ingress_scraper/default.ini', (err, stdout, stderr) => {
        if(err) {
          console.error('[database.js] [scrape_portal.py]', err);
        } else { console.log('[Ontime] ['+MAIN.Bot_Time(null,'stamp')+'] Ran Gym Update Script.');; }
      });
    } return ot.done();
  });
  //------------------------------------------------------------------------------
  //  DATABASE CHECK INTERVAL
  //------------------------------------------------------------------------------
  setInterval(function() {
    // SEND QUEST DMs
    MAIN.pdb.query(`SELECT * FROM quest_alerts WHERE alert_time < UNIX_TIMESTAMP()*1000`, function (error, alerts, fields) {
      if(alerts && alerts[0]){
        alerts.forEach( async (alert,index) => {
          setTimeout(async function() {
            let guild = MAIN.BOTS[alert.bot].guilds.cache.get(alert.discord_id);
            let user = guild.fetchMember(alert.user_id).catch(error => { console.error('[BAD USER ID] '+alert.user_id, error); });
            MAIN.BOTS[alert.bot].guilds.cache.get(alert.discord_id).fetchMember(alert.user_id).then( TARGET => {
              let quest_embed = JSON.parse(alert.embed);
              TARGET.send({ embed: quest_embed }).catch( error => {
                return console.error('['+MAIN.Bot_Time(null,'stamp')+'] '+TARGET.user.tag+' ('+alert.user_id+') , CANNOT SEND THIS USER A MESSAGE.',error);
              });
            });
          }, 2000*index);
        });
        if(MAIN.debug.Quests == 'ENABLED' && MAIN.debug.Subscriptions == 'ENABLED'){ console.log(MAIN.Color.pink+'[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [bot.js] [QUESTS] Sent '+alerts.length+' Quest Alerts out.'+MAIN.Color.reset); }
        MAIN.pdb.query(`DELETE FROM quest_alerts WHERE alert_time < UNIX_TIMESTAMP()*1000`, function (error, alerts, fields) { if(error){ console.error; } });
      }
    });
    // CHECK FOR ENDED ACTIVE RAIDS
    MAIN.pdb.query(`SELECT * FROM active_raids WHERE expire_time < UNIX_TIMESTAMP() AND boss_name != "expired" AND active = ?`, [true], function (error, active_raids, fields) {
      if(active_raids && active_raids[0]){
        active_raids.forEach( async (raid,index) => {
          let raid_channel = MAIN.channels.cache.get(raid.raid_channel);
          if(raid_channel){
            raid_channel.setName('expired').catch(console.error)
            raid_channel.send('Raid has ended, channel will delete in 15 minutes. Wrap up converation or join another raid lobby.').catch(console.error);
          }
          MAIN.pdb.query(`UPDATE active_raids set boss_name = "expired" WHERE gym_id = ?`, [raid.gym_id], function (error, fields) { if(error){ console.error; } });
        });
      }
    });
    // DELETE EXPIRED ACTIVE RAIDS
    MAIN.pdb.query(`SELECT * FROM active_raids WHERE expire_time < UNIX_TIMESTAMP()-900`, function (error, active_raids, fields) {
      if(active_raids && active_raids[0]){
        active_raids.forEach( async (raid,index) => {
          let raid_channel = MAIN.channels.cache.get(raid.raid_channel);
          let raid_role = '';
          if(raid_channel) {
            raid_role = raid_channel.guild.roles.get(raid.role_id);
            if(raid_role){ raid_role.delete().catch(console.error); }
            raid_channel.delete().catch(console.error);
            MAIN.pdb.query(`DELETE FROM active_raids WHERE gym_id = ?`, [raid.gym_id], function (error, active_raids, fields) { if(error){ console.error; } });
          }
        });
        MAIN.pdb.query(`DELETE FROM active_raids WHERE expire_time < UNIX_TIMESTAMP()-900 AND raid_channel IS NULL`, function (error, active_raids, fields) { if(error){ console.error; } });
      }
    }); return;
  }, 1000 * 60);
}
//------------------------------------------------------------------------------
//  UNKNOWN ERROR HANDLING
//------------------------------------------------------------------------------
// LOG FOR DISCORD CONNECTION ERROR
MAIN.on('error', (error) => {
    console.error('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] Discord client encountered an error: '+ error);
    MAIN.restart('due to an error. '+error.code, process.env.fork);
});
// LOG FOR UNCAUGHTEXCEPTION
process.on('uncaughtException', (err) => {
    console.error('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] There was an uncaught error', err)
    MAIN.restart('due to an uncaught error'+err, process.env.fork)
})
//------------------------------------------------------------------------------
//  INTERVAL UPDATES
//------------------------------------------------------------------------------
setInterval(function() { load_arrays(); }, 60000 * 360); // 6 HOURS
//------------------------------------------------------------------------------
//  LOAD ALL FUNCTIONS
//------------------------------------------------------------------------------
fs.readdir(__dirname+'/../functions', (err,functions) => {
  let function_files = functions.filter(f => f.split('.').pop()==='js'), funct_count = 0;
  function_files.forEach((f,i) => {
    delete require.cache[require.resolve(__dirname+'/../functions/'+f)]; funct_count++;
    MAIN[f.slice(0,-3)] = require(__dirname+'/../functions/'+f);
  });
});
//------------------------------------------------------------------------------
//  LOAD ALL CHANNEL FILES
//------------------------------------------------------------------------------
const raid_channels = ini.parse(fs.readFileSync('./config/channels_raids.ini', 'utf-8'));
const pokemon_channels = ini.parse(fs.readFileSync('./config/channels_pokemon.ini', 'utf-8'));
const pvp_channels = ini.parse(fs.readFileSync('./config/channels_pvp.ini', 'utf-8'));
const quest_channels = ini.parse(fs.readFileSync('./config/channels_quests.ini', 'utf-8'));
const lure_channels = ini.parse(fs.readFileSync('./config/channels_lure.ini', 'utf-8'));
const invasion_channels = ini.parse(fs.readFileSync('./config/channels_invasion.ini', 'utf-8'));
//------------------------------------------------------------------------------
//  LOAD BASE SCRIPTS
//------------------------------------------------------------------------------
MAIN.rdmdb = MySQL.createConnection({
  host: MAIN.config.rdmDB.host,
  user: MAIN.config.rdmDB.username,
  password: MAIN.config.rdmDB.password,
  port: MAIN.config.rdmDB.port,
  database : MAIN.config.rdmDB.db_name
});
MAIN.pdb = MySQL.createConnection({
  host: MAIN.config.DB.host,
  user: MAIN.config.DB.username,
  password: MAIN.config.DB.password,
  port: MAIN.config.DB.port,
  database : MAIN.config.DB.db_name
});
MAIN.pmsf = MySQL.createConnection({
  host: MAIN.config.pmsfDB.host,
  user: MAIN.config.pmsfDB.username,
  password: MAIN.config.pmsfDB.password,
  port: MAIN.config.pmsfDB.port,
  database : MAIN.config.pmsfDB.db_name
});
//------------------------------------------------------------------------------
//  LOAD BASE SCRIPTS
//------------------------------------------------------------------------------
var Emojis, Raid_Feed, Raid_Subscription, Quest_Feed, Quest_Subscription, Pokemon_Feed,
Pokemon_Subscription, PVP_Feed, PVP_Subscription, Lure_Feed, Lure_Subscription,
Invasion_Feed, Invasion_Subscription;
async function load_data(){
//------------------------------------------------------------------------------
//  FEED AND SUBSCRIPTION FUNCTIONS
//------------------------------------------------------------------------------
  delete require.cache[require.resolve('../filtering/raids.js')];
  Raid_Feed = require('../filtering/raids.js');
  delete require.cache[require.resolve('../subscriptions/raids.js')];
  Raid_Subscription = require('../subscriptions/raids.js');
  delete require.cache[require.resolve('../filtering/quests.js')];
  Quest_Feed = require('../filtering/quests.js');
  delete require.cache[require.resolve('../subscriptions/quests.js')];
  Quest_Subscription = require('../subscriptions/quests.js');
  delete require.cache[require.resolve('../filtering/pokemon.js')];
  Pokemon_Feed = require('../filtering/pokemon.js');
  delete require.cache[require.resolve('../subscriptions/pokemon.js')];
  Pokemon_Subscription = require('../subscriptions/pokemon.js');
  delete require.cache[require.resolve('../filtering/pvp.js')];
  PVP_Feed = require('../filtering/pvp.js');
  delete require.cache[require.resolve('../subscriptions/pvp.js')];
  PVP_Subscription = require('../subscriptions/pvp.js');
  delete require.cache[require.resolve('../filtering/lure.js')];
  Lure_Feed = require('../filtering/lure.js');
  delete require.cache[require.resolve('../subscriptions/lure.js')];
  Lure_Subscription = require('../subscriptions/lure.js');
  delete require.cache[require.resolve('../filtering/invasion.js')];
  Invasion_Feed = require('../filtering/invasion.js');
  delete require.cache[require.resolve('../subscriptions/invasion.js')];
  Invasion_Subscription = require('../subscriptions/invasion.js');
  delete require.cache[require.resolve('./emojis.js')];
//------------------------------------------------------------------------------
//  CACHE DATA FROM JSONS
//------------------------------------------------------------------------------
  MAIN.grunts = await MAIN.Fetch_JSON("https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/grunttype.json");
  MAIN.items = await MAIN.Fetch_JSON("https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/items.json");
  MAIN.quests = await MAIN.Fetch_JSON("https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/questtype.json");
  MAIN.quest_rewards = await MAIN.Fetch_JSON("https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/rewardtype.json");
  delete require.cache[require.resolve('../../static/database.json')];
  MAIN.db = require('../../static/database.json');
  delete require.cache[require.resolve('../../static/types.json')];
  MAIN.types = require('../../static/types.json');
  delete require.cache[require.resolve('../../static/masterfile.json')];
  MAIN.masterfile = require('../../static/masterfile.json');
  delete require.cache[require.resolve('../../static/cp_multiplier.json')];
  MAIN.cp_multiplier = require('../../static/cp_multiplier.json');
  delete require.cache[require.resolve('../../static/gyms.json')];
  MAIN.gym_notes = require('../../static/gyms.json');
  delete require.cache[require.resolve('../../static/rewards.json')];
  MAIN.rewards = require('../../static/rewards.json');
  delete require.cache[require.resolve('../../config/discords.json')];
  MAIN.Discords = require('../../config/discords.json');
  MAIN.config = ini.parse(fs.readFileSync('./config/config.ini', 'utf-8'));
//------------------------------------------------------------------------------
//  LOAD ALL FEEDS
//------------------------------------------------------------------------------
  MAIN.Raid_Channels = [];
  for (var key in raid_channels){ MAIN.Raid_Channels.push([key, raid_channels[key]]); }
  if(process.env.fork == 0){ console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] [Start-Up] Loaded '+MAIN.Raid_Channels.length+' Raid Feeds'); }
  MAIN.Pokemon_Channels = [];
  for (var key in pokemon_channels){ MAIN.Pokemon_Channels.push([key, pokemon_channels[key]]); }
  if(process.env.fork == 0){ console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] [Start-Up] Loaded '+MAIN.Pokemon_Channels.length+' Pokemon Feeds'); }
  MAIN.PVP_Channels = [];
  for (var key in pvp_channels){ MAIN.PVP_Channels.push([key, pvp_channels[key]]); }
  if(process.env.fork == 0){ console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] [Start-Up] Loaded '+MAIN.PVP_Channels.length+' PVP Feeds'); }
  MAIN.Quest_Channels = [];
  for (var key in quest_channels){ MAIN.Quest_Channels.push([key, quest_channels[key]]); }
  if(process.env.fork == 0){ console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] [Start-Up] Loaded '+MAIN.Quest_Channels.length+' Quest Feeds'); }
  MAIN.Lure_Channels = [];
  for (var key in lure_channels){ MAIN.Lure_Channels.push([key, lure_channels[key]]); }
  if(process.env.fork == 0){ console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] [Start-Up] Loaded '+MAIN.Lure_Channels.length+' Lure Feeds'); }
  MAIN.Invasion_Channels = [];
  for (var key in invasion_channels){ MAIN.Invasion_Channels.push([key, invasion_channels[key]]); }
  if(process.env.fork == 0){ console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] [Start-Up] Loaded '+MAIN.Invasion_Channels.length+' Invasion Feeds'); }
//------------------------------------------------------------------------------
//  LOAD FILTERS
//------------------------------------------------------------------------------
  MAIN.Filters = new Discord.Collection();
  fs.readdir('./filters', (err,filters) => {
    let filter_files = filters.filter(f => f.split('.').pop()==='json'), filter_count = 0;
    filter_files.forEach((f,i) => {
      delete require.cache[require.resolve('../../filters/'+f)]; filter_count++;
      let filter = require('../../filters/'+f); filter.name = f; MAIN.Filters.set(f, filter);
    });
  });
//------------------------------------------------------------------------------
//  LOAD GEOFENCES
//------------------------------------------------------------------------------
  MAIN.Geofences = new Discord.Collection();
  fs.readdir('./geofences', (err,geofences) => {
    let geofence_files = geofences.filter(g => g.split('.').pop()==='json'), geofence_count = 0;
    geofence_files.forEach((g,i) => {;
      delete require.cache[require.resolve('../../geofences/'+g)]; geofence_count++;
      let geofence = require('../../geofences/'+g); geofence.name = g; MAIN.Geofences.set(g, geofence);
    });
  });
  return; // END FUNCTION
}
//------------------------------------------------------------------------------
//  LOG COLORS
//------------------------------------------------------------------------------
MAIN.Color = {
  "reset": "\x1b[0m", "underlined": "\x1b[4m", "lred": "\x1b[91m",
  "red": "\x1b[31m", "lgreen": "\x1b[92m", "green": "\x1b[32m",
  "lyellow": "\x1b[93m", "yellow": "\x1b[33m", "lblue": "\x1b[94m",
  "blue": "\x1b[34m", "lcyan": "\x1b[96m", "cyan": "\x1b[36m",
  "pink": "\x1b[95m", "purple": "\x1b[35m",

  "bgwhite": "\x1b[107m", "bggray": "\x1b[100m", "bgred": "\x1b[41m",
  "bggreen": "\x1b[42m", "bglgreen": "\x1b[102m", "bgyellow": "\x1b[43m",
  "bgblue": "\x1b[44m", "bglblue": "\x1b[104m", "bgcyan": "\x1b[106m",
  "bgpink": "\x1b[105m", "bgpurple": "\x1b[45m",

  "hlwhite": "\x1b[7m", "hlred": "\x1b[41m\x1b[30m", "hlgreen": "\x1b[42m\x1b[30m",
  "hlblue": "\x1b[44m\x1b[37m", "hlcyan": "\x1b[104m\x1b[30m", "hlyellow": "\x1b[43m\x1b[30m",
  "hlpink": "\x1b[105m\x1b[30m", "hlpurple": "\x1b[45m\x1b[37m"
};
//------------------------------------------------------------------------------
//  WEBHOOK PARSER
//------------------------------------------------------------------------------
setTimeout(function(){ MAIN.Active = true; },30000);
MAIN.webhookParse = async (PAYLOAD) => {
  // IGNORE IF BOT HAS NOT BEEN FINISHED STARTUP
  if(MAIN.Active == undefined){ return; }
  // SEPARATE EACH PAYLOAD AND SORT
  await PAYLOAD.forEach( async (data,index) => {
    // IGNORE IF NOT A SPECIFIED OBJECT
    if(data.type == 'pokemon' || data.type == 'raid' || data.type == 'quest' || data.type == 'pokestop' || data.type == 'invasion'){
      // Speed debugging
      if(MAIN.debug.PROCESSING_SPEED == 'ENABLED'){
        data.message.wdrReceived = new Date().getTime();
      }

      MAIN.Discords.Servers.forEach( async (server,index) => {

        if(InsideGeojson.polygon(server.geofence, [data.message.longitude,data.message.latitude])){
          // DEFINE AND DETERMINE TIMEZONE
          let timezone = GeoTz(server.geofence[0][1][1], server.geofence[0][1][0])[0];
          if (MAIN.config.coordinate_timezone = 'ENABLED'){
            timezone = GeoTz(data.message.latitude,data.message.longitude)[0];
          }
          // DEFINE AREAS FROM GEOFENCE FILE
          let area = {};
          if(server.geojson_file){
            let geofence = await MAIN.Geofences.get(server.geojson_file);
            await geofence.features.forEach((geo,index) => {
              if(InsideGeojson.feature({features:[geo]}, [data.message.longitude,data.message.latitude]) != -1){
                switch(geo.properties.sub_area){
                  case 'true': area.sub = geo.properties.name; break;
                  default: area.main = geo.properties.name;
                }
              }
            });
          }
          // ASSIGN AREA TO VARIABLES
          if(area.sub){ area.embed = area.sub; }
          if(area.main && !area.sub){ area.embed = area.main; }
          if(!area.sub && !area.main){ area.embed = server.name; }
          // SEND TO OBJECT MODULES
          switch(data.type){
            // SEND TO POKEMON MODULES
            case 'pokemon':
              let encounter = MAIN.Detect_Ditto(MAIN, data.message);
              encounter.locale = await MAIN.Get_Data(MAIN, encounter);
              encounter.size = MAIN.Get_Size(MAIN, encounter.pokemon_id, encounter.form, encounter.height, encounter.weight);
              Pokemon_Feed.run(MAIN, encounter, area, server, timezone);
              Pokemon_Subscription.run(MAIN, encounter, area, server, timezone);
              // ONLY RUN PVP WHEN POKEMON HAS IV CHECK
              if(encounter.individual_attack != null) {
                // Change gender from proto number to word
                let gender = encounter.gender;
                switch(gender){
                  case 1: gender = 'male'; break;
                  case 2: gender = 'female'; break;
                  default: gender = 'all';
                }
                encounter.great_league = await pvp.CalculatePossibleCPs(MAIN,encounter.pokemon_id, encounter.form, encounter.individual_attack, encounter.individual_defense, encounter.individual_stamina, encounter.pokemon_level, gender, "great");
                encounter.ultra_league = await pvp.CalculatePossibleCPs(MAIN,encounter.pokemon_id, encounter.form, encounter.individual_attack, encounter.individual_defense, encounter.individual_stamina, encounter.pokemon_level, gender, "ultra");
                PVP_Feed.run(MAIN, encounter, area, server, timezone);
                PVP_Subscription.run(MAIN, encounter, area, server, timezone);
              } return;
            // SEND TO RAIDS MODULES
            case 'raid':
              let raid = data.message;
              // SET CURRENT EX-RAID BOSS IF NOT SET ON THE BACKEND
              if(raid.is_exclusive == true && raid.pokemon_id == 0){
                raid.pokemon_id = 150;
                raid.form = 135;
              } raid.locale = await MAIN.Get_Data(MAIN, raid);
              Raid_Feed.run(MAIN, raid, area, server, timezone);
              Raid_Subscription.run(MAIN, raid, area, server, timezone);
              return;
            // SEND TO QUESTS MODULES
            case 'quest':
              console.log(data.message)
              let quest = data.message;
              quest.locale = await MAIN.Get_Data(MAIN, {pokemon_id: quest.rewards[0].info.pokemon_id, form: quest.rewards[0].info.form_id});
              Quest_Feed.run(MAIN, quest, area, server, timezone);
              Quest_Subscription.run(MAIN, quest, area, server, timezone);
              return;
            // SEND TO LURE MODULES
            case 'pokestop':
              Lure_Feed.run(MAIN, data.message, area, server, timezone);
              Lure_Subscription.run(MAIN, data.message, area, server, timezone);
              return;
            // SEND TO INVASION MODULES
            case 'invasion':
              Invasion_Feed.run(MAIN, data.message, area, server, timezone);
              Invasion_Subscription.run(MAIN, data.message, area, server, timezone);
              return;
            default: return;
          }
        } else { return; }
      }); return;
    }
  });
}

// SQL QUERY FUNCTION
MAIN.sqlFunction = (sql,data,logSuccess,logError) => {
  return new Promise(resolve => {
  	MAIN.pdb.query(sql, data, function (error, result, fields) {
  		if(error){ console.error(logError,error); }
      if(logSuccess){ console.info(logSuccess); }
      return resolve(result);
  	}); return;
  });
}

MAIN.asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
//------------------------------------------------------------------------------
//  CREATE DATA ARRAYS
//------------------------------------------------------------------------------
MAIN.gym_array = []; MAIN.stop_array = []
MAIN.pokemon_array = []; MAIN.park_array = [];
function load_arrays(){
  // LOAD POKEMON ARRAY
  MAIN.pokemon_array = Object.keys(MAIN.masterfile.pokemon).map(i => MAIN.masterfile.pokemon[i].name);
  // Gym Names Array
  MAIN.rdmdb.query(`SELECT * FROM gym WHERE name is not NULL`, function (error, gyms, fields){
    if(gyms){
      gyms.forEach((gym,index) => {
        let record = {};
        record.name = gym.name; record.id = gym.id;
        record.lat = gym.lat; record.lon = gym.lon;
        MAIN.gym_array.push(record);
      }); return;
    } else{ return; }
  });
  // POKESTOP NAMES ARRAY
  MAIN.rdmdb.query(`SELECT * FROM pokestop WHERE name is not NULL`, function (error, stops, fields){
    if(stops){
      stops.forEach((stop,index) => {
        let record = {};
        record.name = stop.name; record.id = stop.id;
        record.lat = stop.lat; record.lon = stop.lon;
        MAIN.stop_array.push(record);
      }); return;
    } else{ return; }
  });
  // NEST NAMES ARRAY
  MAIN.pmsf.query(`SELECT * FROM nests WHERE name != 'Unknown Areaname'`, function (error, parks, fields){
    if(parks){
      parks.forEach((park,index) => {
        let record = {};
        record.name = park.name; record.id = park.nest_id;
        record.lat = park.lat; record.lon = park.lon;
        MAIN.park_array.push(record);
      }); return;
    } else{ return; }
  });
}
//------------------------------------------------------------------------------
//  CREATE DATABASE, TABLES, AND CHECK FOR UPDATES
//------------------------------------------------------------------------------
async function update_database(){
  return new Promise(async function(resolve, reject) {
    await MAIN.sqlFunction('CREATE TABLE IF NOT EXISTS users (user_id TEXT, user_name TEXT, geofence TEXT, pokemon TEXT, quests TEXT, raids TEXT, paused TEXT, bot TEXT, alert_time TEXT, city TEXT)', undefined, undefined,'['+MAIN.Bot_Time(null,'stamp')+'] UNABLE TO CREATE THE user TABLE.');
    await MAIN.sqlFunction('CREATE TABLE IF NOT EXISTS quest_alerts (user_id TEXT, quest TEXT, embed TEXT, area TEXT, bot TEXT, alert_time bigint, city text)', undefined, undefined,'['+MAIN.Bot_Time(null,'stamp')+'] UNABLE TO CREATE THE quest_alerts TABLE.');
    await MAIN.sqlFunction('CREATE TABLE IF NOT EXISTS info (db_version INT)', undefined, undefined,'['+MAIN.Bot_Time(null,'stamp')+'] UNABLE TO CREATE THE info TABLE.');
    await MAIN.pdb.query('SELECT * FROM info', async function (error, row, fields) {
      if(!row || !row[0]){
        await MAIN.sqlFunction('INSERT INTO info (db_version) VALUES (?)', [1], undefined,'['+MAIN.Bot_Time(null,'stamp')+'] UNABLE TO INSERT INTO THE info TABLE.')
          .then(async (db) => {
            let version = await update_each_version(1);
            return resolve(version);
          });
      } else if(row[0].db_version < MAIN.db.LATEST){
        await console.log('[update_database] ['+MAIN.Bot_Time(null,'stamp')+'] Database Update Found. Updating...');
        let version = await update_each_version(row[0].db_version);
        return resolve(version);
      } else{ return resolve(false); }
    }); return;
  });
}
//------------------------------------------------------------------------------
//  PERFORM AN UPDATE FOR EACH VERSION UP TO LATEST
//------------------------------------------------------------------------------
async function update_each_version(version){
  return new Promise(async (resolve) => {
    for(let u = version; u <= MAIN.db.LATEST; u++){
      if(u == MAIN.db.LATEST){ return resolve('DONE'); }
      else{
        let update_to = u+1;
        await MAIN.db[update_to].forEach(async (update,index) => {
          await MAIN.sqlFunction(update.sql, update.data, '['+MAIN.Bot_Time(null,'stamp')+'] '+update.gLog, update.bLog);
          await MAIN.sqlFunction('UPDATE info SET db_version = ? WHERE db_version = ?', [update_to,u], undefined, '[db_update] ['+MAIN.Bot_Time(null,'stamp')+'] UNABLE TO UPDATE THE info TABLE.');
          console.log('['+MAIN.Bot_Time(null,'stamp')+'] Database updated to Version '+update_to+'.');
        });
      }
    } return resolve('done');
  });
}
//------------------------------------------------------------------------------
//  STARTUP FUNCTION INTIALIZATION
//------------------------------------------------------------------------------
MAIN.Initialize = async (type) => {
  await load_data();
  if(process.env.fork == 0){
    await update_database();
  }
  await load_arrays();
  switch(type){
    case 'startup': return bot_login();
    case 'reload': return console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] [bot.js] '+MAIN.config.BOT_NAME+' has re-loaded.');
    default: return;
  }
}
//------------------------------------------------------------------------------
//  LOGIN ALL BOTS WITH AVAILABLE TOKENS
//------------------------------------------------------------------------------
async function bot_login(){
  let tokens = MAIN.config.TOKENS.BOT_TOKENS;
  let bots_available = [ALPHA,BRAVO,CHARLIE,DELTA,ECHO,FOXTROT,GULF,HOTEL,INDIA,JULIET,KILO,LIMA,MIKE,NOVEMBER,OSCAR]
  await tokens.forEach( async (token,index) => {
    if(token != 'TOKEN'){
      MAIN.BOTS.push(bots_available[index]);
      await bots_available[index].login(token);
    }
  }); return bots_ready();
}
//------------------------------------------------------------------------------
//  INITIALIZE READY AND ERROR LISTENERS
//------------------------------------------------------------------------------
async function bots_ready(){
  let tokens = MAIN.config.TOKENS.BOT_TOKENS;
  let bots_available = [ALPHA,BRAVO,CHARLIE,DELTA,ECHO,FOXTROT,GULF,HOTEL,INDIA,JULIET,KILO,LIMA,MIKE,NOVEMBER,OSCAR]
  MAIN.BOTS.forEach((this_bot,index) => {
    this_bot.on('ready', () => {
      if(MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED'){ this_bot.user.setPresence({ status: 'invisible' }); }
      if(index == (MAIN.BOTS.length-1)){ return startup_notification(); }
    });
    this_bot.on('error', (error) => {
        console.error('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] Discord client encountered an error: '+ error);
    });
  });
}
//------------------------------------------------------------------------------
//  FINAL STARTUP FUNCTIONS AND VARIABLES
//------------------------------------------------------------------------------
async function startup_notification(){
  // SET ACTIVE BOOLEAN TO TRUE AND BOT POOL TO ZERO
  MAIN.Next_Bot = 0;
  // LOG INSTANCE INITIATION
  if(process.env.fork == 0){
    // MAIN.pdb.query('SELECT * FROM users', function (error, rows, fields) {
    //   let num = 0;
    //   rows.forEach((row,index) => {
    //     if(num == MAIN.BOTS.length-1){ num = 0; }
    //     else{ num++; }
    //     console.log('Set '+row.user_id+' to '+num);
    //     MAIN.pdb.query(`UPDATE users set bot = ? WHERE user_id = ?`,[num, row.user_id], function (error, fields) { if(error){ console.error; } });
    //   });
    // });
    console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] [Child#'+process.env.fork+'] Fully Initiated (Command Handler).');
  } else {
    console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] [Child#'+process.env.fork+'] Fully Initiated.');
  }
  // SEND STARTUP EMBED
  if(MAIN.config.log_channel && process.env.fork == 0){
    let log_ping = MAIN.config.log_ping ? MAIN.config.log_ping : '';
    let ready_embed = new Discord.MessageEmbed()
      .setColor('00ff00')
      .setTitle('**'+MAIN.config.BOT_NAME+' is Ready.**')
      .setDescription(MAIN.Raid_Channels.length+' Raid Feeds\n'+
                      MAIN.Pokemon_Channels.length+' Pokemon Feeds\n'+
                      MAIN.Quest_Channels.length+' Quest Feeds\n'+
                      MAIN.Lure_Channels.length+' Lure Feeds\n'+
                      MAIN.Invasion_Channels.length+' Invasion Feeds')
    MAIN.Send_Embed(MAIN, 'member', 0, '', log_ping, ready_embed, MAIN.config.log_channel);
  } return;
}
//------------------------------------------------------------------------------
//  LOGIN MAIN AND INITIALIZE ALL BOTS
//------------------------------------------------------------------------------
MAIN.login(MAIN.config.TOKENS.MAIN);
MAIN.on('ready', async () => {
  MAIN.Initialize('startup');
  delete require.cache[require.resolve(__dirname+'/emojis.js')];
  Emojis = require(__dirname+'/emojis.js');
  MAIN.emotes = new Emojis.DiscordEmojis();
  MAIN.emotes.Load(MAIN, MAIN.config.EMOJI_SERVERS.split(","));
});
//------------------------------------------------------------------------------
//  RESTART FUNCTION
//------------------------------------------------------------------------------
MAIN.restart = (reason, code) => {
  console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] ['+MAIN.config.BOT_NAME+'] is re-starting #'+process.env.fork+' '+reason);
  process.exit(code).catch(console.error);
  return;
}
//------------------------------------------------------------------------------
//  UNIVERSAL SLEEP FUNCTION
//------------------------------------------------------------------------------
MAIN.Sleep = (seconds) => {
  return new Promise(function(resolve) {
    setTimeout(function() {
      return resolve(true);
    },seconds * 1000);
  });
}

module.exports = MAIN;
