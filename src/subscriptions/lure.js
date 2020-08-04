delete require.cache[require.resolve(__dirname + '/../embeds/lure.js')];
const Send_Lure = require(__dirname + '/../embeds/lure.js');

module.exports = async (WDR, lure, area, server, timezone) => {
  //if(!lure.pokemon_id){ return; }

  //  if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Lure == 'ENABLED'){ console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [lure.js] Received '+WDR.Get_Lure(lure.lure_id)+' lure for '+server.name+'.'); }
  //
  //  // FETCH ALL USERS FROM THE USERS TABLE AND CHECK SUBSCRIPTIONS
  // WDR.wdrDB.query(`SELECT * FROM users WHERE guild_id = ? AND status = ?`, [server.id, 'ACTIVE'], function (error, users, fields){
  //    if(users && users[0]){
  //      users.forEach((user,index) => {
  //
  //        //FETCH THE GUILD MEMBER AND CHECK IF A ADMINISTRATOR/DONOR
  //        if(user.discord_id != server.id){return;}
  //        let member = WDR.Bot.guilds.cache.get(server.id).members.cache.get(user.user_id);
  //        switch(true){
  //          case !member:
  //          case member == undefined: return;
  //          case WDR.Config.Donor_Check == 'DISABLED': break;
  //          case !member.roles.cache.has(server.donor_role): return;
  //        }
  //
  //        // DEFINE VARIABLES
  //        let user_areas = user.areas.split(',');
  //        let embed = 'lure.js';
  //
  //        // CHECK IF THE USER HAS SUBS
  //        if(user.lure && user.lure_status == 'ACTIVE'){
  //
  //          // CONVERT lure LIST TO AN ARRAY
  //          let lure_subs = JSON.parse(user.lure);
  //          let type = WDR.Get_Lure(lure.lure_id);
  //
  //          // CHECK EACH USER SUBSCRIPTION
  //          lure_subs.subscriptions.forEach((sub,index) => {
  //
  //            // CHECK IF THE GYM ID MATCHES THE USER'S SUBSCRIPTION
  //            if(sub.id == lure.pokestop_id || sub.stop == 'All'){
  //
  //              // CHECK IF THE lure BOSS NAME MATCHES THE USER'S SUB
  //              if(type == sub.type || sub.type == 'All'){
  //
  //                // CHECK IF THE AREA IS WITHIN THE USER'S GEOFENCES
  //                if(sub.areas == 'No' || sub.areas == 'Stop Specified'){
  //                  Send_Lure(WDR, user, lure, type, area, server, timezone, '', embed);
  //                } else if(user.areas == server.name || user_areas.indexOf(area.WDR) >= 0 || user_areas.indexOf(area.sub) >= 0){
  //                  Send_Lure(WDR, user, lure, type, area, server, timezone, '', embed);
  //                } else{ if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Lure == 'ENABLED'){ console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [lure.js] Did Not Pass '+user.user_name+'\'s Area Filter.'); } }
  //              } else{ if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Lure == 'ENABLED'){ console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [lure.js] Did Not Pass '+user.user_name+'\'s Lure Type Filter.'); } }
  //            } else{ if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Lure == 'ENABLED'){ console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [lure.js] Did Not Pass '+user.user_name+'\'s Stop Name Filter.'); } }
  //          });
  //        }
  //      });
  //    } return;
  //  });
  return;
}