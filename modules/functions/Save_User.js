const moment = require('moment-timezone');
const GeoTz = require('geo-tz');

// SAVE A USER IN THE USER TABLE
module.exports = (MAIN, message, server) => {
  MAIN.pdb.query('SELECT * FROM info', function (error, info, fields) {
    let next_bot = info[0].user_next_bot, split = MAIN.config.QUEST.Default_Delivery.split(':');
    if(next_bot == MAIN.BOTS.length-1){ next_bot = 0; } else{ next_bot++; }
    let quest_time = moment(), timezone = GeoTz(server.geofence[0][0][1], server.geofence[0][0][0]);
    quest_time = moment.tz(quest_time, timezone[0]).set({hour: split[0], minute: split[1] ,second:0 ,millisecond:0});
    quest_time = moment.tz(quest_time, MAIN.config.TIMEZONE).format('HH:mm');
    user_name = message.member.user.tag.replace(/[\W]+/g,'');
    MAIN.pdb.query('INSERT INTO users (user_id, user_name, geofence, pokemon, quests, raids, bot, alert_time, discord_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_name = ?',
      [message.author.id, user_name, server.name, , , , next_bot, quest_time, message.guild.id, user_name], function (error, user, fields) {
      if(error){ return console.error('[Save_User] ['+MAIN.Bot_Time(null,'stamp')+'] [bot.js] UNABLE TO ADD USER TO users TABLE',error); }
      else{
        MAIN.sqlFunction('UPDATE info SET user_next_bot = ?',[next_bot],undefined,undefined);
        return console.log('[Save_User] ['+MAIN.Bot_Time(null,'stamp')+'] [bot.js] Added '+message.member.user.tag+' to the user table.');
      }
    });
  }); return;
}
