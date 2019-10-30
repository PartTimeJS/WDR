delete require.cache[require.resolve('../embeds/raids.js')];
const Send_Raid = require('../embeds/raids.js');
const Discord = require('discord.js');

module.exports.run = async (MAIN, raid, main_area, sub_area, embed_area, server, timezone) => {

  // DEFINE VARIABLES
  let type = '', boss_name = '';
  let embed = {};

  if(raid.cp > 0 || raid.is_exclusive == true){
    type = 'Boss';
    if (raid.pokemon_id == 0) {
      boss_name = 'exRaid';
    } else {
      boss_name = raid.locale.pokemon_name;
    }
    embed.embed = 'raids.js'
  }
  else{ type = 'Egg'; boss_name = 'Lvl'+raid.level; embed.embed = 'raid_eggs.js';}

  if(MAIN.debug.Subscriptions == 'ENABLED' && MAIN.debug.Raids == 'ENABLED'){ console.info('[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [raids.js] Received '+boss_name+' Raid for '+server.name+'.'); }

  // FETCH ALL USERS FROM THE USERS TABLE AND CHECK SUBSCRIPTIONS
  MAIN.pdb.query(`SELECT * FROM users WHERE discord_id = ? AND status = ?;`, [server.id, 'ACTIVE'], function (error, raid_subs, fields){
    if(raid_subs && raid_subs[0]){
      raid_subs.forEach((user,index) => {

        //FETCH THE GUILD MEMBER AND CHECK IF A ADMINISTRATOR/DONOR
        if(user.discord_id != server.id){return;}
        let member = MAIN.guilds.get(server.id).members.get(user.user_id);
        switch(true){
          case !member:
          case member == undefined: return;
          case MAIN.config.Donor_Check == 'DISABLED': break;
          case !member.roles.has(server.donor_role): return;
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
                      return raidFailed(MAIN, user, boss_name, "Raid Form. Expected: "+sub.form+' | Saw: '+raid.form,false);
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
                      case sub.areas == 'No': area_pass = true; break;
                      case sub.areas == 'Gym Specified':
                        area_pass = true; break;
                      case sub.areas !== 'Yes':
                        if(sub.areas.split(',').indexOf(main_area) >= 0){ area_pass = true; }
                        if(sub.areas.split(',').indexOf(sub_area) >= 0){ area_pass = true; } break;
                      case user.geofence == server.name:
                        area_pass = true; break;
                      case user_areas.indexOf(main_area) >= 0:
                        area_pass = true; break;
                      case user_areas.indexOf(sub_area) >= 0:
                        area_pass = true; break;
                    }

                    if(area_pass == true){
                      Send_Raid.run(MAIN, user, raid, type, main_area, sub_area, embed_area, server, timezone, '', embed);
                    } else{ return raidFailed(MAIN, user, boss_name, 'Area Filter') }
                  } else{ return raidFailed(MAIN, user, boss_name, 'Max Raid Level Filter') }
                } else{ return raidFailed(MAIN, user, boss_name, 'Min Raid Level Filter') }
              } else{ return raidFailed(MAIN, user, boss_name, 'Raid Boss Name Filter') }
            } else{ return raidFailed(MAIN, user, boss_name, 'Gym Name Filter') }
          });
        }
      });
    } return;
  });
}

function raidFailed(MAIN, user, raid, reason){
  if(MAIN.debug.Subscriptions == 'ENABLED' && MAIN.debug.Raids == 'ENABLED'){ console.info(MAIN.Color.purple+'[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [raids.js] '+raid+' Did Not Pass '+user.user_name+'\'s '+reason+'.'+MAIN.Color.reset); } return;
}
