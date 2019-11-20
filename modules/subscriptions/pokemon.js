const Send_Pokemon = require('../embeds/pokemon.js');
const Send_PvP = require('../embeds/pvp.js');
const pvp = require('../base/pvp.js');


module.exports.run = async (MAIN, sighting, area, server, timezone) => {

  let internal_value = (sighting.individual_defense+sighting.individual_stamina+sighting.individual_attack)/45;
  let time_now = new Date().getTime(); internal_value = Math.floor(internal_value*1000)/10;

  let generation = MAIN.Get_Gen(MAIN, sighting.pokemon_id);

  // FETCH ALL USERS CHECK POKEMON SUBSCRIPTIONS
  MAIN.pdb.query(`SELECT * FROM users WHERE discord_id = ? AND status = ?;`, [server.id, 'ACTIVE'], function (error, pokemon_subs, fields){
    if(pokemon_subs && pokemon_subs[0]){
      pokemon_subs.forEach(async (user,index) => {

        //FETCH THE GUILD MEMBER AND CHECK IF A ADMINISTRATOR/DONOR
        if(user.discord_id != server.id){ return; }
        let member = MAIN.guilds.get(server.id).members.get(user.user_id);
        switch(true){
          case !member:
          case member == undefined: return;
          case MAIN.config.Donor_Check == 'DISABLED': break;
          case !member.roles.has(server.donor_role) && !member.roles.some(r=>server.donor_role.includes(r.id)): return;
        }

        // DEFINE VARIABLES
        let user_areas = user.geofence.split(',');
        let embed = '';

        // CHECK IF THE USERS SUBS ARE PAUSED, EXIST, AND THAT THE AREA MATCHES THEIR DISCORD
        if(user.pokemon && user.pokemon_status == 'ACTIVE' && MAIN.config.POKEMON.Subscriptions == 'ENABLED'){

          // SET DEFAULT EMBED STYLE
          if(sighting.cp > 0) { embed = 'pokemon_iv.js'; }
          else{ embed = 'pokemon.js'; }

          // CONVERT POKEMON LIST TO AN ARRAY
          let pokemon = JSON.parse(user.pokemon);

          // CHECK EACH USER SUBSCRIPTION
          pokemon.subscriptions.forEach((sub,index) => {

            // SET NEW VARIABLES THAT MIGHT BE UNDEFINED
            if (!sub.size) { sub.size = 'all'; }
            let size = sub.size.toLowerCase() == 'all' ? 'all' : sighting.size;
            sub.form = sub.form ? sub.form : 'ALL';

            // AREA CHECK
            let area_pass = false;
            switch(true){
              case !sub.areas:
              case (sub.areas.toLowerCase() == 'no' || sub.areas.toLowerCase() == 'all'):
                area_pass = true; break;
              case user.geofence == server.name:
                area_pass = true; break;
              case user_areas.indexOf(area.main) >= 0:
                area_pass = true; break;
              case user_areas.indexOf(area.sub) >= 0:
                area_pass = true; break;
            }

            // CHECK IF THE AREA IS WITHIN THE USER'S GEOFENCES
            if(area_pass == true){

              // POKEMON NAME FILTERS
              switch (true) {
                case sub.name == undefined: return console.error('[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [subs/pokemon.js] Problem with '+user.user_name+'\'s Pokemon subscription.');
                case sub.name.startsWith(sighting.locale.pokemon_name):
                case sub.name.toLowerCase().startsWith('all'):
                case sub.name ==  generation:

                  // FORM FILTER
                  switch (true) {
                    case sub.name.startsWith('All'):
                    case sighting.form == 0:
                    case sighting.form == sub.form:
                    case sub.form == 'ALL':
                      // DETERMINE GENDER
                      sub.gender = sub.gender.toLowerCase();
                      if(sighting.gender == 1){ gender = 'male'; }
                      else if(sighting.gender == 2){ gender = 'female'; }
                      else{ gender = 'all'; }

                      switch(true){
                        case sub.min_iv.length > 3:
                          // SPLIT THE IVs UP INTO INDIVIDUAL STATS
                          let min_iv = sub.min_iv.split('/');
                          let max_iv = sub.max_iv.split('/');

                          // CHECK ALL SUBSCRIPTION REQUIREMENTS
                          switch(true){
                            case sighting.individual_attack < min_iv[0]: break;
                            case sighting.individual_defense < min_iv[1]: break;
                            case sighting.individual_stamina < min_iv[2]: break;
                            case sighting.individual_attack > max_iv[0]: break;
                            case sighting.individual_defense > max_iv[1]: break;
                            case sighting.individual_stamina > max_iv[2]: break;
                            case sub.min_cp > sighting.cp: break;
                            case sub.max_cp < sighting.cp: break;
                            case sub.min_lvl > sighting.pokemon_level: break;
                            case sub.max_lvl < sighting.pokemon_level: break;
                            case sub.size.toLowerCase() != size: break;
                            default:
                              if(sub.gender.toLowerCase() == 'all' || sub.gender.toLowerCase() == gender){
                                Send_Pokemon.run(MAIN, true, user, sighting, internal_value, time_now, area, server, timezone, '', embed);
                              }
                          } break;
                        default:
                          switch(true){
                            case sub.min_iv > internal_value:  break;
                            case sub.max_iv < internal_value: break;
                            case sub.min_cp > sighting.cp: break;
                            case sub.max_cp < sighting.cp: break;
                            case sub.min_lvl > sighting.pokemon_level: break;
                            case sub.max_lvl < sighting.pokemon_level: break;
                            case sub.size.toLowerCase() != size: break;
                            default:
                              if(sub.gender.toLowerCase() == 'all' || sub.gender.toLowerCase() == gender){
                                Send_Pokemon.run(MAIN, true, user, sighting, internal_value, time_now, area, server, timezone, '', embed);
                              }
                          }
                      } break;
                  } break;
              }
            }
          });
        }
      });
    } return;
  });
}

function sightingFailed(MAIN, user, sighting, reason, pvp){
  switch (pvp) {
    case true:
      if(MAIN.debug.PVP == 'ENABLED' && MAIN.debug.Subscriptions == 'ENABLED'){ return console.info(MAIN.Color.blue+'[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [subs/pokemon.js] [PvP] '+sighting.locale.pokemon_name+' failed '+user.user_name+'\'s because of '+reason+' check.'+MAIN.Color.reset); }
    default:
      if(MAIN.debug.Pokemon == 'ENABLED' && MAIN.debug.Subscriptions == 'ENABLED'){ return console.info(MAIN.Color.cyan+'[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [subs/pokemon.js] '+sighting.locale.pokemon_name+' failed '+user.user_name+'\'s because of '+reason+' check.'+MAIN.Color.reset); }
  }
}
