delete require.cache[require.resolve('../embeds/invasion.js')];
const Send_Invasion = require('../embeds/invasion.js');

module.exports.run = async (MAIN, invasion, area, server, timezone) => {
  //if(!invasion.pokemon_id){ return; }

  if(MAIN.debug.Subscriptions == 'ENABLED' && MAIN.debug.Invasion == 'ENABLED'){ console.info('[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [invasion.js] Received '+MAIN.grunts[invasion.grunt_type].type+' invasion for '+server.name+'.'); }

  // FETCH ALL USERS FROM THE USERS TABLE AND CHECK SUBSCRIPTIONS
  MAIN.pdb.query(`SELECT * FROM users WHERE discord_id = ? AND status = ?`, [server.id, 'ACTIVE'], function (error, users, fields){
    if(users && users[0]){
      users.forEach((user,index) => {

        //FETCH THE GUILD MEMBER AND CHECK IF A ADMINISTRATOR/DONOR
        let member = MAIN.guilds.cache.get(server.id).members.get(user.user_id);
        switch(true){
          case !member:
          case member == undefined: return;
          case MAIN.config.Donor_Check == 'DISABLED': break;
          case !member.roles.has(server.donor_role): return;
        }

        // DEFINE VARIABLES
        let user_areas = user.geofence.split(',');
        let embed = 'invasion.js';

        // CHECK IF THE USER HAS SUBS
        if(user.invasion && user.invasion_status == 'ACTIVE'){

          // CHECK FOR GRUNT TYPE
          if(!MAIN.grunts[invasion.grunt_type]){
              return //console.error("[subs/invasion.js] ["+MAIN.Bot_Time(null,'stamp')+"] No Grunt found for "+invasion.grunt_type+" in Grunts.json.");
          }

          // CONVERT INVASION LIST TO AN ARRAY
          let invasion_subs = JSON.parse(user.invasion);
          let type = MAIN.grunts[invasion.grunt_type].type;
          if(!type){
            return //console.error("[subs/invasion.js] ["+MAIN.Bot_Time(null,'stamp')+"] No Grunt found for "+invasion.grunt_type+" in Grunts.json.");
          }
          let gender = MAIN.grunts[invasion.grunt_type].gender;

          // CHECK EACH USER SUBSCRIPTION
          invasion_subs.subscriptions.forEach((sub,index) => {

            // CHECK IF THE GYM ID MATCHES THE USER'S SUBSCRIPTION
            if(sub.id == invasion.pokestop_id || sub.stop == 'All'){

              // CHECK IF THE INVASION TYPE MATCHES THE USER'S SUB
              if(!sub.type){sub.type = sub.encounter;}
              if(type.startsWith(sub.type) || sub.type == 'All'){

                // CHECK IF THE INVASION GENDER MATCHES THE USER'S SUB
                if (!sub.gender) { sub.gender = 'All'; }
                if (gender == sub.gender || sub.gender == 'All'){

                  // CHECK IF THE AREA IS WITHIN THE USER'S GEOFENCES
                  if(sub.areas == 'No' || sub.areas == 'Stop Specified'){
                    Send_Invasion.run(MAIN, user, invasion, type, area, server, timezone, '', embed);
                  } else if(user.geofence == server.name || user_areas.indexOf(area.main) >= 0 || user_areas.indexOf(area.sub) >= 0){
                    Send_Invasion.run(MAIN, user, invasion, type, area, server, timezone, '', embed);
                  } else{
                    if(MAIN.debug.Subscriptions == 'ENABLED' && MAIN.debug.Invasion == 'ENABLED'){ console.info('[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [invasion.js] Did Not Pass '+user.user_name+'\'s Area Filter.'); }
                  }
                } else{
                  if(MAIN.debug.Subscriptions == 'ENABLED' && MAIN.debug.Invasion == 'ENABLED'){ console.info('[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [invasion.js] Did Not Pass '+user.user_name+'\'s Gender Filter.'); }
                }
              } else{
                if(MAIN.debug.Subscriptions == 'ENABLED' && MAIN.debug.Invasion == 'ENABLED'){ console.info('[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [invasion.js] Did Not Pass '+user.user_name+'\'s invasion Type Filter.'); }
              }
            } else{
              if(MAIN.debug.Subscriptions == 'ENABLED' && MAIN.debug.Invasion == 'ENABLED'){ console.info('[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [invasion.js] Did Not Pass '+user.user_name+'\'s Stop Name Filter.'); }
            }
          });
        }
      });
    } return;
  });
}
