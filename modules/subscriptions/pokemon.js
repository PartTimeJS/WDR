delete require.cache[require.resolve('../embeds/pokemon.js')];
delete require.cache[require.resolve('../embeds/pvp.js')];
const Send_Pokemon = require('../embeds/pokemon.js');
const Send_PvP = require('../embeds/pvp.js');
const pvp = require('../base/pvp.js');
const Discord = require('discord.js');

module.exports.run = async (MAIN, sighting, main_area, sub_area, embed_area, server, timezone) => {

  let internal_value = (sighting.individual_defense+sighting.individual_stamina+sighting.individual_attack)/45;
  let time_now = new Date().getTime(); internal_value = Math.floor(internal_value*1000)/10;
  if(MAIN.config.BLACKLISTED && MAIN.config.BLACKLISTED.split(',').indexOf(sighting.pokemon_id) >= 0){ return; }
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
          case !member.roles.has(server.donor_role): return;
        }

        // DEFINE VARIABLES
        let user_areas = user.geofence.split(',');
        let embed = {};

        // CHECK IF THE USERS SUBS ARE PAUSED, EXIST, AND THAT THE AREA MATCHES THEIR DISCORD
        if(user.pokemon && user.pokemon_status == 'ACTIVE' && MAIN.config.POKEMON.Subscriptions == 'ENABLED'){
          // SET DEFAULT EMBED STYLE
          if(sighting.cp > 0) { embed.embed = 'pokemon_iv.js'; }
          else{ embed.embed = 'pokemon.js'; }

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
              case sub.areas == 'No':
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

            // CHECK IF THE AREA IS WITHIN THE USER'S GEOFENCES
            if(area_pass == true){

              // POKEMON NAME FILTERS
              switch (true) {
                case sub.name == undefined: return console.error('[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [pokemon.js] Problem with '+user.user_name+'\'s Pokemon subscription.');
                case sub.name.startsWith(sighting.locale.pokemon_name):
                case sub.name.toLowerCase().startsWith('all'):
                case sub.name == 'Gen1' && generation == 'Gen1':
                case sub.name == 'Gen2' && generation == 'Gen2':
                case sub.name == 'Gen3' && generation == 'Gen3':
                case sub.name == 'Gen4' && generation == 'Gen4':
                case sub.name == 'Gen5' && generation == 'Gen5':
                case sub.name == 'Gen6' && generation == 'Gen6':
                case sub.name == 'Gen7' && generation == 'Gen7':

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
                              if(sub.gender == 'all' || sub.gender == gender){
                                Send_Pokemon.run(MAIN, true, user, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, '', embed);
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
                              if(sub.gender == 'all' || sub.gender == gender){
                                Send_Pokemon.run(MAIN, true, user, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, '', embed);
                              }
                          }
                      }
                      break;
                    default: return sightingFailed(MAIN, user, sighting, "Sighting Form",false);
                  }
                  break;
                default: return sightingFailed(MAIN, user, sighting, 'Name Filters',false);
              }
            } else{ return sightingFailed(MAIN, user, sighting, 'Area Filter',false); }
          });
        }

        // PVP SUBSCRIPTION CHECK IF THE USERS SUBS ARE PAUSED, EXIST, AND THAT THE AREA MATCHES THEIR DISCORD
        if(user.pvp && user.pvp_status == 'ACTIVE' && MAIN.config.PVP.Subscriptions == 'ENABLED'){
          // SET DEFAULT EMBED STYLE
          embed.embed = 'pvp.js';

          // CONVERT PVP LIST TO AN ARRAY
          let pokemon_pvp = JSON.parse(user.pvp);

          // CHECK EACH USER PVP SUBSCRIPTION
          pokemon_pvp.subscriptions.forEach((sub,index) => {
            // AREA CHECK
            let area_pass = false;
            switch(true){
              case !sub.areas:
              case sub.areas == 'No':
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

            // CHECK IF THE AREA IS WITHIN THE USER'S GEOFENCES
            if(area_pass == true){

              // CHECK FOR EVOLUTIONS FOR NAME FILTER
              let evolution_pass = false, sub_id = 0;
              for (key in MAIN.masterfile.pokemon) {
                 if (MAIN.masterfile.pokemon[key].name === sub.name.split(' ')[0]) {
                   sub_id = key;
              }}
              MAIN.masterfile.pokemon[sighting.pokemon_id].evolutions.forEach((evolve_id) => {
                if(evolve_id == sub_id){ evolution_pass = true; }
                MAIN.masterfile.pokemon[evolve_id].evolutions.forEach((evolved_id) => {
                  if(evolved_id == sub_id){ evolution_pass = true; }
              }); });

              // CHECK POKEMON NAME
              if(sub.name.startsWith(sighting.locale.pokemon_name) || sub.name.toLowerCase().startsWith('all') || evolution_pass == true){


                if(sub.min_rank.toString().toLowerCase() == 'all'){
                  sub.min_rank = 4096;
                }
                if(sub.min_percent.toString().toLowerCase() == 'all'){
                  sub.min_percent = 0;
                }

                // PVP Filtering
                // no need to calculate possible CP if current CP wasn't provided
                if(!sighting.cp) return;
                if(sighting.cp > sub.max_cp) { return sightingFailed(MAIN, user, sighting, "Max CP Range",true); }
                let possible_cps = pvp.CalculatePossibleCPs(MAIN, sighting.pokemon_id, sighting.form, sighting.individual_attack, sighting.individual_defense, sighting.individual_stamina, sighting.pokemon_level, gender, sub.min_cp, sub.max_cp);
                let unique_cps = {};

                for(var i = possible_cps.length - 1; i >= 0; i--){
                  if(!unique_cps[possible_cps[i].pokemonID]){
                    unique_cps[possible_cps[i].pokemonID] = {};
                    let pvpRanks = pvp.CalculateTopRanks(MAIN, possible_cps[i].pokemonID, possible_cps[i].formID, sub.max_cp);
                    let rank = pvpRanks[sighting.individual_attack][sighting.individual_defense][sighting.individual_stamina];
                    unique_cps[possible_cps[i].pokemonID].rank = rank.rank;
                    unique_cps[possible_cps[i].pokemonID].percent = rank.percent;
                    unique_cps[possible_cps[i].pokemonID].level = rank.level;
                    unique_cps[possible_cps[i].pokemonID].cp = possible_cps[i].cp;
                  }
                }

                unique_cps = pvp.FilterPossibleCPsByRank(unique_cps, sub.min_rank);
                unique_cps = pvp.FilterPossibleCPsByPercent(unique_cps, sub.min_percent);

                if(Object.keys(unique_cps).length == 0 ) { return sightingFailed(MAIN, user, sighting, "CP Range",true); }

                Send_PvP.run(MAIN, user, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, '', embed, unique_cps);
              } else{ return sightingFailed(MAIN, user, sighting, 'Name Filters',true); }
            } else{ return sightingFailed(MAIN, user, sighting, 'Area Filter',true); }
          });
        }
      });
    } return;
  });
}

function sightingFailed(MAIN, user, sighting, reason, pvp){
  switch (pvp) {
    case true:
      if(MAIN.debug.PVP == 'ENABLED' && MAIN.debug.Subscriptions == 'ENABLED'){ return console.info(MAIN.Color.blue+'[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [pokemon.js] [PvP] '+sighting.locale.pokemon_name+' failed '+user.user_name+'\'s because of '+reason+' check.'+MAIN.Color.reset); }
    default:
      if(MAIN.debug.Pokemon == 'ENABLED' && MAIN.debug.Subscriptions == 'ENABLED'){ return console.info(MAIN.Color.cyan+'[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [pokemon.js] '+sighting.locale.pokemon_name+' failed '+user.user_name+'\'s because of '+reason+' check.'+MAIN.Color.reset); }
  }
}
