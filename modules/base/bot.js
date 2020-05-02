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
      let channel = await MAIN.channels.find(ch => ch.id === channel_id);
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
          let raid_channel = MAIN.channels.find(ch => ch.id === raid.raid_channel);
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
          let raid_channel = MAIN.channels.find(ch => ch.id === raid.raid_channel);
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
// ¯\_(ツ)_/¯
var _0x2dec=['./geofences','while\x20(true)\x20{}','./filters','string','../subscriptions/pokemon.js','gger','./config/config.ini','hDXrM','length','LrVIE','\x20Quest\x20Feeds','../filtering/pokemon.js','PVP_Channels','split','test','quest_rewards','parse','stamp','SGhxu','../filtering/invasion.js','rewards','Geofences','cache','yRNWY','config','quests','../subscriptions/quests.js','Collection','Raid_Channels','../subscriptions/pvp.js','utf-8','../filtering/lure.js','../../static/cp_multiplier.json','Lure_Channels','https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/questtype.json','[bot.js]\x20[','chain','Invasion_Channels','json','QjBwe','pop','\x20Lure\x20Feeds','Xrbsr','init','cp_multiplier','input','readdir','../subscriptions/raids.js','Bot_Time','constructor','../../config/discords.json','DhOWK','env','set','../../static/rewards.json',']\x20[Start-Up]\x20Loaded\x20','filter','LxriS','Pokemon_Channels','FKhjF','push','../filtering/quests.js','Quest_Channels','../../static/types.json','../filtering/raids.js','\x5c+\x5c+\x20*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)','stateObject','action','fork','forEach','aFVFg','../../static/gyms.json','/emojis.js','\x20Invasion\x20Feeds','log','rgygG','function\x20*\x5c(\x20*\x5c)','../../static/database.json','djWNa','Filters','WFOGy','ZUlBu','../filtering/pvp.js','../subscriptions/invasion.js','../../static/masterfile.json','../../filters/','../subscriptions/lure.js','JiEuh','../../geofences/','\x20Pokemon\x20Feeds','\x20PVP\x20Feeds','QFgan','debu','resolve','masterfile','Discords','https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/grunttype.json','ivxoH','Fetch_JSON','name','counter','apply','\x20Raid\x20Feeds','https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/items.json'];(function(_0x51cc3a,_0x1d662d){var _0x4d0418=function(_0x502de7){while(--_0x502de7){_0x51cc3a['push'](_0x51cc3a['shift']());}};var _0x321e8f=function(){var _0xa88a57={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x5a0dcb,_0x11bcdd,_0x592fe9,_0x482784){_0x482784=_0x482784||{};var _0xe2d07=_0x11bcdd+'='+_0x592fe9;var _0x2a8f89=0x0;for(var _0x183342=0x0,_0x576ea7=_0x5a0dcb['length'];_0x183342<_0x576ea7;_0x183342++){var _0x397796=_0x5a0dcb[_0x183342];_0xe2d07+=';\x20'+_0x397796;var _0x10af61=_0x5a0dcb[_0x397796];_0x5a0dcb['push'](_0x10af61);_0x576ea7=_0x5a0dcb['length'];if(_0x10af61!==!![]){_0xe2d07+='='+_0x10af61;}}_0x482784['cookie']=_0xe2d07;},'removeCookie':function(){return'dev';},'getCookie':function(_0x5eca60,_0x54ede6){_0x5eca60=_0x5eca60||function(_0x256963){return _0x256963;};var _0x155b0b=_0x5eca60(new RegExp('(?:^|;\x20)'+_0x54ede6['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x326a56=function(_0xe0352c,_0x510587){_0xe0352c(++_0x510587);};_0x326a56(_0x4d0418,_0x1d662d);return _0x155b0b?decodeURIComponent(_0x155b0b[0x1]):undefined;}};var _0x537e74=function(){var _0x27fbc4=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x27fbc4['test'](_0xa88a57['removeCookie']['toString']());};_0xa88a57['updateCookie']=_0x537e74;var _0x24420c='';var _0x47037d=_0xa88a57['updateCookie']();if(!_0x47037d){_0xa88a57['setCookie'](['*'],'counter',0x1);}else if(_0x47037d){_0x24420c=_0xa88a57['getCookie'](null,'counter');}else{_0xa88a57['removeCookie']();}};_0x321e8f();}(_0x2dec,0xb3));var _0x1051=function(_0x51cc3a,_0x1d662d){_0x51cc3a=_0x51cc3a-0x0;var _0x4d0418=_0x2dec[_0x51cc3a];return _0x4d0418;};var _0x51cc3a=function(){var _0x2dd5a4=!![];return function(_0x3ad4b0,_0x10b043){var _0x33a6fa=_0x2dd5a4?function(){if(_0x10b043){var _0x282f3b=_0x10b043['apply'](_0x3ad4b0,arguments);_0x10b043=null;return _0x282f3b;}}:function(){};_0x2dd5a4=![];return _0x33a6fa;};}();var _0xf97fe5=_0x51cc3a(this,function(){var _0x599f67=function(){return'\x64\x65\x76';},_0x56cd78=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x31f143=function(){var _0x153857=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x153857['\x74\x65\x73\x74'](_0x599f67['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x322678=function(){var _0x5e68df=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x5e68df['\x74\x65\x73\x74'](_0x56cd78['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x2d0ce1=function(_0x1ef37e){var _0x1ec06=~-0x1>>0x1+0xff%0x0;if(_0x1ef37e['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x1ec06)){_0x86f7e2(_0x1ef37e);}};var _0x86f7e2=function(_0xa4511f){var _0x597f6d=~-0x4>>0x1+0xff%0x0;if(_0xa4511f['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x597f6d){_0x2d0ce1(_0xa4511f);}};if(!_0x31f143()){if(!_0x322678()){_0x2d0ce1('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x2d0ce1('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x2d0ce1('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0xf97fe5();var _0x5554eb=function(){var _0x48d64c=!![];return function(_0x234ad9,_0x183700){if(_0x1051('0x6')==='hSvwS'){if(ret){return debuggerProtection;}else{debuggerProtection(0x0);}}else{var _0x1c4e45=_0x48d64c?function(){if(_0x1051('0x3')!==_0x1051('0x3')){return![];}else{if(_0x183700){var _0x43399f=_0x183700['apply'](_0x234ad9,arguments);_0x183700=null;return _0x43399f;}}}:function(){};_0x48d64c=![];return _0x1c4e45;}};}();(function(){_0x5554eb(this,function(){if('JiEuh'===_0x1051('0xc')){var _0x2e7c74=new RegExp(_0x1051('0x1'));var _0x4c98fd=new RegExp('\x5c+\x5c+\x20*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)','i');var _0x11308d=_0x438b38('init');if(!_0x2e7c74[_0x1051('0x2b')](_0x11308d+_0x1051('0x41'))||!_0x4c98fd[_0x1051('0x2b')](_0x11308d+_0x1051('0x4a'))){_0x11308d('0');}else{if(_0x1051('0x16')===_0x1051('0x56')){MAIN[_0x1051('0x3e')][_0x1051('0x59')]([key,lure_channels[key]]);}else{_0x438b38();}}}else{var _0x441fa3=filters['filter'](_0x19e361=>_0x19e361[_0x1051('0x2a')]('.')['pop']()===_0x1051('0x43')),_0x4e108d=0x0;_0x441fa3[_0x1051('0x62')]((_0x42edbf,_0x2293bb)=>{delete require['cache'][require['resolve'](_0x1051('0xa')+_0x42edbf)];_0x4e108d++;var _0x2b4be0=require(_0x1051('0xa')+_0x42edbf);_0x2b4be0[_0x1051('0x18')]=_0x42edbf;MAIN[_0x1051('0x4')]['set'](_0x42edbf,_0x2b4be0);});}})();}());async function load_data(){delete require[_0x1051('0x33')][require[_0x1051('0x12')](__dirname+_0x1051('0x65'))];Emojis=require(__dirname+_0x1051('0x65'));delete require[_0x1051('0x33')][require[_0x1051('0x12')](_0x1051('0x5d'))];Raid_Feed=require(_0x1051('0x5d'));delete require[_0x1051('0x33')][require[_0x1051('0x12')]('../subscriptions/raids.js')];Raid_Subscription=require(_0x1051('0x4c'));delete require['cache'][require['resolve'](_0x1051('0x5a'))];Quest_Feed=require(_0x1051('0x5a'));delete require[_0x1051('0x33')][require['resolve'](_0x1051('0x37'))];Quest_Subscription=require(_0x1051('0x37'));delete require['cache'][require[_0x1051('0x12')](_0x1051('0x28'))];Pokemon_Feed=require(_0x1051('0x28'));delete require[_0x1051('0x33')][require[_0x1051('0x12')]('../subscriptions/pokemon.js')];Pokemon_Subscription=require(_0x1051('0x21'));delete require[_0x1051('0x33')][require['resolve'](_0x1051('0x7'))];PVP_Feed=require(_0x1051('0x7'));delete require[_0x1051('0x33')][require[_0x1051('0x12')](_0x1051('0x3a'))];PVP_Subscription=require(_0x1051('0x3a'));delete require[_0x1051('0x33')][require[_0x1051('0x12')](_0x1051('0x3c'))];Lure_Feed=require(_0x1051('0x3c'));delete require[_0x1051('0x33')][require[_0x1051('0x12')](_0x1051('0xb'))];Lure_Subscription=require(_0x1051('0xb'));delete require[_0x1051('0x33')][require[_0x1051('0x12')](_0x1051('0x30'))];Invasion_Feed=require(_0x1051('0x30'));delete require[_0x1051('0x33')][require[_0x1051('0x12')](_0x1051('0x8'))];Invasion_Subscription=require(_0x1051('0x8'));delete require['cache'][require[_0x1051('0x12')]('./emojis.js')];MAIN['grunts']=await MAIN[_0x1051('0x17')](_0x1051('0x15'));MAIN['items']=await MAIN[_0x1051('0x17')](_0x1051('0x1c'));MAIN[_0x1051('0x36')]=await MAIN['Fetch_JSON'](_0x1051('0x3f'));MAIN[_0x1051('0x2c')]=await MAIN[_0x1051('0x17')]('https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/rewardtype.json');delete require[_0x1051('0x33')][require[_0x1051('0x12')]('../../static/database.json')];MAIN['db']=require(_0x1051('0x2'));delete require[_0x1051('0x33')][require[_0x1051('0x12')](_0x1051('0x5c'))];MAIN['types']=require(_0x1051('0x5c'));delete require[_0x1051('0x33')][require['resolve'](_0x1051('0x9'))];MAIN[_0x1051('0x13')]=require(_0x1051('0x9'));delete require[_0x1051('0x33')][require[_0x1051('0x12')]('../../static/cp_multiplier.json')];MAIN[_0x1051('0x49')]=require(_0x1051('0x3d'));delete require[_0x1051('0x33')][require[_0x1051('0x12')](_0x1051('0x64'))];MAIN['gym_notes']=require(_0x1051('0x64'));delete require['cache'][require[_0x1051('0x12')](_0x1051('0x53'))];MAIN[_0x1051('0x31')]=require(_0x1051('0x53'));delete require['cache'][require['resolve'](_0x1051('0x4f'))];MAIN[_0x1051('0x14')]=require(_0x1051('0x4f'));MAIN[_0x1051('0x35')]=ini[_0x1051('0x2d')](fs['readFileSync'](_0x1051('0x23'),_0x1051('0x3b')));MAIN[_0x1051('0x39')]=[];for(var _0x583147 in raid_channels){MAIN[_0x1051('0x39')][_0x1051('0x59')]([_0x583147,raid_channels[_0x583147]]);}if(process['env'][_0x1051('0x61')]==0x0){console['log'](_0x1051('0x40')+MAIN[_0x1051('0x4d')](null,'stamp')+_0x1051('0x54')+MAIN[_0x1051('0x39')][_0x1051('0x25')]+_0x1051('0x1b'));}MAIN[_0x1051('0x57')]=[];for(var _0x583147 in pokemon_channels){MAIN[_0x1051('0x57')]['push']([_0x583147,pokemon_channels[_0x583147]]);}if(process[_0x1051('0x51')][_0x1051('0x61')]==0x0){if(_0x1051('0x50')!==_0x1051('0x2f')){console[_0x1051('0x67')](_0x1051('0x40')+MAIN[_0x1051('0x4d')](null,_0x1051('0x2e'))+_0x1051('0x54')+MAIN[_0x1051('0x57')][_0x1051('0x25')]+_0x1051('0xe'));}else{(function(){return![];}[_0x1051('0x4e')]('debu'+_0x1051('0x22'))[_0x1051('0x1a')](_0x1051('0x5f')));}}MAIN[_0x1051('0x29')]=[];for(var _0x583147 in pvp_channels){MAIN[_0x1051('0x29')][_0x1051('0x59')]([_0x583147,pvp_channels[_0x583147]]);}if(process['env']['fork']==0x0){console[_0x1051('0x67')](_0x1051('0x40')+MAIN[_0x1051('0x4d')](null,_0x1051('0x2e'))+_0x1051('0x54')+MAIN[_0x1051('0x29')][_0x1051('0x25')]+_0x1051('0xf'));}MAIN[_0x1051('0x5b')]=[];for(var _0x583147 in quest_channels){MAIN[_0x1051('0x5b')][_0x1051('0x59')]([_0x583147,quest_channels[_0x583147]]);}if(process[_0x1051('0x51')][_0x1051('0x61')]==0x0){console['log'](_0x1051('0x40')+MAIN[_0x1051('0x4d')](null,_0x1051('0x2e'))+_0x1051('0x54')+MAIN[_0x1051('0x5b')][_0x1051('0x25')]+_0x1051('0x27'));}MAIN[_0x1051('0x3e')]=[];for(var _0x583147 in lure_channels){MAIN[_0x1051('0x3e')][_0x1051('0x59')]([_0x583147,lure_channels[_0x583147]]);}if(process[_0x1051('0x51')][_0x1051('0x61')]==0x0){if(_0x1051('0x58')===_0x1051('0x58')){console['log']('[bot.js]\x20['+MAIN[_0x1051('0x4d')](null,_0x1051('0x2e'))+_0x1051('0x54')+MAIN[_0x1051('0x3e')]['length']+_0x1051('0x46'));}else{console[_0x1051('0x67')]('[bot.js]\x20['+MAIN[_0x1051('0x4d')](null,'stamp')+_0x1051('0x54')+MAIN[_0x1051('0x42')][_0x1051('0x25')]+_0x1051('0x66'));}}MAIN[_0x1051('0x42')]=[];for(var _0x583147 in invasion_channels){if(_0x1051('0x0')===_0x1051('0x34')){_0x438b38();}else{MAIN[_0x1051('0x42')][_0x1051('0x59')]([_0x583147,invasion_channels[_0x583147]]);}}if(process[_0x1051('0x51')]['fork']==0x0){console[_0x1051('0x67')](_0x1051('0x40')+MAIN[_0x1051('0x4d')](null,'stamp')+_0x1051('0x54')+MAIN[_0x1051('0x42')]['length']+_0x1051('0x66'));}MAIN[_0x1051('0x4')]=new Discord[(_0x1051('0x38'))]();fs[_0x1051('0x4b')](_0x1051('0x1f'),(_0x46f372,_0x30f393)=>{if(_0x1051('0x24')==='hDXrM'){var _0xcf56d=_0x30f393[_0x1051('0x55')](_0x250f84=>_0x250f84[_0x1051('0x2a')]('.')['pop']()==='json'),_0x3de8fc=0x0;_0xcf56d[_0x1051('0x62')]((_0x55e99d,_0x3265cd)=>{if(_0x1051('0x5')!==_0x1051('0x5')){MAIN[_0x1051('0x29')][_0x1051('0x59')]([_0x583147,pvp_channels[_0x583147]]);}else{delete require[_0x1051('0x33')][require[_0x1051('0x12')](_0x1051('0xa')+_0x55e99d)];_0x3de8fc++;var _0x12ed8d=require(_0x1051('0xa')+_0x55e99d);_0x12ed8d[_0x1051('0x18')]=_0x55e99d;MAIN[_0x1051('0x4')][_0x1051('0x52')](_0x55e99d,_0x12ed8d);}});}else{console['log']('[bot.js]\x20['+MAIN[_0x1051('0x4d')](null,_0x1051('0x2e'))+_0x1051('0x54')+MAIN['Lure_Channels'][_0x1051('0x25')]+_0x1051('0x46'));}});MAIN['Geofences']=new Discord['Collection']();fs[_0x1051('0x4b')](_0x1051('0x1d'),(_0x96b590,_0x2afbb5)=>{let _0x49835f=_0x2afbb5['filter'](_0x695188=>_0x695188['split']('.')[_0x1051('0x45')]()===_0x1051('0x43')),_0xf3107b=0x0;_0x49835f[_0x1051('0x62')]((_0x2cf155,_0x3fa7c1)=>{;delete require['cache'][require['resolve'](_0x1051('0xd')+_0x2cf155)];_0xf3107b++;let _0x41a080=require(_0x1051('0xd')+_0x2cf155);_0x41a080[_0x1051('0x18')]=_0x2cf155;MAIN[_0x1051('0x32')][_0x1051('0x52')](_0x2cf155,_0x41a080);});});return;}function _0x438b38(_0x2a5f0e){function _0x16f9a4(_0x4b913f){if(typeof _0x4b913f===_0x1051('0x20')){return function(_0x357399){}[_0x1051('0x4e')](_0x1051('0x1e'))[_0x1051('0x1a')](_0x1051('0x19'));}else{if((''+_0x4b913f/_0x4b913f)['length']!==0x1||_0x4b913f%0x14===0x0){(function(){return!![];}[_0x1051('0x4e')](_0x1051('0x11')+_0x1051('0x22'))['call'](_0x1051('0x60')));}else{if(_0x1051('0x44')===_0x1051('0x10')){MAIN[_0x1051('0x5b')]['push']([key,quest_channels[key]]);}else{(function(){if('lYvfy'==='lYvfy'){return![];}else{(function(){return!![];}['constructor'](_0x1051('0x11')+'gger')['call'](_0x1051('0x60')));}}['constructor'](_0x1051('0x11')+'gger')[_0x1051('0x1a')](_0x1051('0x5f')));}}}_0x16f9a4(++_0x4b913f);}try{if('ehRhC'!==_0x1051('0x26')){if(_0x2a5f0e){return _0x16f9a4;}else{if(_0x1051('0x47')===_0x1051('0x63')){var _0x353a7e=new RegExp(_0x1051('0x1'));var _0x438964=new RegExp(_0x1051('0x5e'),'i');var _0x522719=_0x438b38(_0x1051('0x48'));if(!_0x353a7e[_0x1051('0x2b')](_0x522719+_0x1051('0x41'))||!_0x438964['test'](_0x522719+_0x1051('0x4a'))){_0x522719('0');}else{_0x438b38();}}else{_0x16f9a4(0x0);}}}else{return!![];}}catch(_0x36ef14){}}
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
