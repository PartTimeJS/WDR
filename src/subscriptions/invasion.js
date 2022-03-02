// module.exports = async (WDR, invasion, area, server, timezone) => {
//     //if(!invasion.pokemon_id){ return; }

//     //  if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Invasion == 'ENABLED'){ console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [invasion.js] Received '+WDR.Master.invasions[invasion.grunt_type].type+' invasion for '+server.name+'.'); }
//     //
//     //  // FETCH ALL USERS FROM THE USERS TABLE AND CHECK SUBSCRIPTIONS
//     // WDR.wdrDB.query(`SELECT * FROM users WHERE guild_id = ? AND status = ?`, [server.id, 'ACTIVE'], function (error, users){
//     //    if(users && users[0]){
//     //      users.forEach((user,index) => {
//     //
//     //        //FETCH THE GUILD MEMBER AND CHECK IF A ADMINISTRATOR/DONOR
//     //        let member = WDR.Bot.guilds.cache.get(server.id).members.fetch(User.user_id);
//     //        switch(true){
//     //          case !member:
//     //          case member == undefined: return;
//     //          case WDR.Config.Donor_Check == 'DISABLED': break;
//     //          case !member.roles.cache.has(server.donor_role): return;
//     //        }
//     //
//     //        // DEFINE VARIABLES
//     //        let user_areas = user.areas.split(',');
//     //        let embed = 'invasion.js';
//     //
//     //        // CHECK IF THE USER HAS SUBS
//     //        if(user.invasion && user.invasion_status == 'ACTIVE'){
//     //
//     //          // CHECK FOR GRUNT TYPE
//     //          if(!WDR.Master.invasions[invasion.grunt_type]){
//     //              return //WDR.Console.error(WDR, "[subs/invasion.js] ["+WDR.Time(null,'stamp')+"] No Grunt found for "+invasion.grunt_type+" in Grunts.json.");
//     //          }
//     //
//     //          // CONVERT INVASION LIST TO AN ARRAY
//     //          let invasion_subs = JSON.parse(user.invasion);
//     //          let type = WDR.Master.invasions[invasion.grunt_type].type;
//     //          if(!type){
//     //            return //WDR.Console.error(WDR, "[subs/invasion.js] ["+WDR.Time(null,'stamp')+"] No Grunt found for "+invasion.grunt_type+" in Grunts.json.");
//     //          }
//     //          let gender = WDR.Master.invasions[invasion.grunt_type].gender;
//     //
//     //          // CHECK EACH USER SUBSCRIPTION
//     //          invasion_subs.subscriptions.forEach((sub,index) => {
//     //
//     //            // CHECK IF THE GYM ID MATCHES THE USER'S SUBSCRIPTION
//     //            if(sub.id == invasion.pokestop_id || sub.stop == 'All'){
//     //
//     //              // CHECK IF THE INVASION TYPE MATCHES THE USER'S SUB
//     //              if(!sub.type){sub.type = sub.encounter;}
//     //              if(type.startsWith(sub.type) || sub.type == 'All'){
//     //
//     //                // CHECK IF THE INVASION GENDER MATCHES THE USER'S SUB
//     //                if (!sub.gender) { sub.gender = 'All'; }
//     //                if (gender == sub.gender || sub.gender == 'All'){
//     //
//     //                  // CHECK IF THE AREA IS WITHIN THE USER'S GEOFENCES
//     //                  if(sub.areas == 'No' || sub.areas == 'Stop Specified'){
//     //                    Send_Invasion(WDR, user, invasion, type, area, server, timezone, '', embed);
//     //                  } else if(user.areas == server.name || user_areas.indexOf(area.WDR) >= 0 || user_areas.indexOf(area.sub) >= 0){
//     //                    Send_Invasion(WDR, user, invasion, type, area, server, timezone, '', embed);
//     //                  } else{
//     //                    if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Invasion == 'ENABLED'){ console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [invasion.js] Did Not Pass '+user.user_name+'\'s Area Filter.'); }
//     //                  }
//     //                } else{
//     //                  if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Invasion == 'ENABLED'){ console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [invasion.js] Did Not Pass '+user.user_name+'\'s Gender Filter.'); }
//     //                }
//     //              } else{
//     //                if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Invasion == 'ENABLED'){ console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [invasion.js] Did Not Pass '+user.user_name+'\'s invasion Type Filter.'); }
//     //              }
//     //            } else{
//     //              if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Invasion == 'ENABLED'){ console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [invasion.js] Did Not Pass '+user.user_name+'\'s Stop Name Filter.'); }
//     //            }
//     //          });
//     //        }
//     //      });
//     //    } return;
//     //  });
//     return;
// }