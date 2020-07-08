delete require.cache[require.resolve(__dirname + '/../embeds/raids.js')];
const Send_Raid = require(__dirname + '/../embeds/raids.js');


module.exports = async (WDR, raid, area, server, timezone) => {

  // DEFINE VARIABLES
  let type = '', boss_name = '';
  let embed = '';

  if(raid.cp > 0 || raid.is_exclusive == true){
    type = 'Boss';
    if (raid.pokemon_id == 0){
      boss_name = 'exRaid';
    } else {
      boss_name = raid.locale.pokemon_name;
    }
    embed = 'raids.js'
  }
  else{
    type = 'Egg';
    boss_name = 'Lvl'+raid.level;
    embed = 'raid_eggs.js';
  }

  if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Raids == 'ENABLED'){ console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [raids.js] Received '+boss_name+' Raid for '+server.name+'.'); }

  // FETCH ALL USERS FROM THE USERS TABLE AND CHECK SUBSCRIPTIONS
 WDR.wdrDB.query(`SELECT * FROM users WHERE discord_id = ? AND status = ?;`, [server.id, 'ACTIVE'], function (error, raid_subs, fields){
    if(raid_subs && raid_subs[0]){
      raid_subs.forEach((user,index) => {

        //FETCH THE GUILD MEMBER AND CHECK IF A ADMINISTRATOR/DONOR
        if(user.discord_id != server.id){return;}
        let member = WDR.Bot.guilds.cache.get(server.id).members.cache.get(user.user_id);
        switch(true){
          case !member:
          case member == undefined: return;
          case WDR.Config.Donor_Check == 'DISABLED': break;
          case !member.roles.cache.has(server.donor_role): return;
        }

        // DEFINE VARIABLES
        let user_areas = user.geofence.split(',');

        // CHECK IF THE USER HAS SUBS
        if(user.raids && user.raids_status == 'ACTIVE'){

          // CONVERT POKEMON LIST TO AN ARRAY
          let subs = JSON.parse(user.raids);

          // CHECK EACH USER SUBSCRIPTION
          subs.subscriptions.forEach((sub,index) => {

            // CHECK IF THE GYM ID MATCHES THE USER'S SUBSCRIPTION
            if(sub.id == raid.gym_id || sub.gym == 'All'){

              // CHECK IF THE RAID BOSS NAME MATCHES THE USER'S SUB
              if(sub.boss == type || sub.boss == 'All' || sub.boss == boss_name){
                if(raid.form > 0 && sub.boss != 'All' && type != 'Egg'){
                  sub.form = sub.form ? sub.form : 'All';
                  switch (true) {
                    case raid.form == sub.form:
                    case sub.form == 'All': break;
                    default:
                      return raidFailed(WDR, user, boss_name, "Raid Form. Expected: "+sub.form+' | Saw: '+raid.form,false);
                  }
                }

                // CHECK THE SUBS MIN LEVEL
                if(sub.min_lvl == 'Boss Specified' || raid.level >= sub.min_lvl || sub.min_lvl == 'All'){

                  // CHECK THE SUBS MAX LEVEL
                  if(sub.max_lvl == 'Boss Specified' || raid.level <= sub.max_lvl || sub.max_lvl == 'All'){

                    // CHECK IF THE AREA IS WITHIN THE USER'S GEOFENCES ETC.
                    let area_pass = false;
                    switch(true){
                      case !sub.areas:
                      case (sub.areas.toLowerCase() == 'no' || sub.areas.toLowerCase() == 'all'): area_pass = true; break;
                      case sub.areas == 'Gym Specified':
                        area_pass = true; break;
                      case user.geofence == server.name:
                        area_pass = true; break;
                      case user_areas.indexOf(area.WDR) >= 0:
                        area_pass = true; break;
                      case user_areas.indexOf(area.sub) >= 0:
                        area_pass = true; break;
                    }

                    if(area_pass == true){
                      Send_Raid(WDR, user, raid, type, area, server, timezone, '', embed);
                    } else{ return raidFailed(WDR, user, boss_name, 'Area Filter') }
                  } else{ return raidFailed(WDR, user, boss_name, 'Max Raid Level Filter') }
                } else{ return raidFailed(WDR, user, boss_name, 'Min Raid Level Filter') }
              } else{ return raidFailed(WDR, user, boss_name, 'Raid Boss Name Filter') }
            } else{ return raidFailed(WDR, user, boss_name, 'Gym Name Filter') }
          });
        }
      });
    } return;
  });
}

function raidFailed(WDR, user, raid, reason){
  if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Raids == 'ENABLED'){ console.log(WDR.Color.purple+'[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [raids.js] '+raid+' Did Not Pass '+user.user_name+'\'s '+reason+'.'+WDR.Color.reset); } return;
}
