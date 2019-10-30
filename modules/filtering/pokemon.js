delete require.cache[require.resolve('../embeds/pokemon.js')];
delete require.cache[require.resolve('../embeds/pvp.js')];
const Send_Pokemon = require('../embeds/pokemon.js');
const Send_PvP = require('../embeds/pvp.js');
const Discord = require('discord.js');
const pvp = require('../base/pvp.js');

module.exports.run = async (MAIN, sighting, main_area, sub_area, embed_area, server, timezone, role_id) => {

  // IF RUNNING UIV AND POKEMON DOESN'T HAVE IV WAIT UNTIL IT IS RESET BY RDM IF/WHEN IT GETS IV CHECKED
  if(MAIN.config.UIV != 'DISABLED' && !sighting.cp) { return; }

  // DON'T FILTER IF FEEDS ARE DISABLED
  if(MAIN.config.POKEMON.Discord_Feeds != 'ENABLED'){ return; }

  // VARIABLES
  let internal_value = (sighting.individual_defense+sighting.individual_stamina+sighting.individual_attack)/45;
  let time_now = new Date().getTime(); internal_value = Math.floor(internal_value*1000)/10;

  // CHECK ALL FILTERS
  MAIN.Pokemon_Channels.forEach((pokemon_channel,index) => {

    // DEFINE FILTER VARIABLES
    let geofences = pokemon_channel[1].geofences.split(',');
    let channel = MAIN.channels.get(pokemon_channel[0]);
    let filter = MAIN.Filters.get(pokemon_channel[1].filter);
    let embed = { embed: pokemon_channel[1].embed ? pokemon_channel[1].embed : '',
                  webhook: pokemon_channel[1].webhook };
    let role_id = '';

    // DETERMINE GENDER
    switch(sighting.gender){
      case 1: gender = 'male'; break;
      case 2: gender = 'female'; break;
      default: gender = 'all';
    }

    // CHECK FOR INVALID DATA
    if(!filter){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The filter defined for'+pokemon_channel[0]+' does not appear to exist.'); }
    if(!channel){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The channel '+pokemon_channel[0]+' does not appear to exist.'); }
    if(filter.Type != 'pokemon'){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The filter defined for'+pokemon_channel[0]+' does not appear to be a pokemon filter.'); }

    // ADD ROLE ID IF IT EXISTS
    if(pokemon_channel[1].roleid){
      if(pokemon_channel[1].roleid == 'here' || pokemon_channel[1].roleid == 'everyone'){
        role_id = '@'+pokemon_channel[1].roleid;
      } else{
        role_id = '<@&'+pokemon_channel[1].roleid+'>';
      }
    }

    // CHECK FILTER GEOFENCES
    if(geofences.indexOf(server.name) >= 0 || geofences.indexOf(main_area) >= 0 || geofences.indexOf(sub_area) >= 0){

      // PVP Filtering
      if(filter.min_cp_range && filter.max_cp_range && MAIN.config.PVP.Discord_Feeds == 'ENABLED'){
        // no need to calculate possible CP if current CP wasn't provided
        if(!sighting.cp) { return };
        if(sighting.cp > filter.max_cp_range) { return sightingFailed(MAIN, filter, sighting, "Max CP Range",true); }
        if(filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name] != 'True'){
          return sightingFailed(MAIN, filter, sighting, "Pokemon: "+sighting.pokemon_id+" set to False",true);
        }
        let possible_cps = pvp.CalculatePossibleCPs(MAIN, sighting.pokemon_id, sighting.form, sighting.individual_attack, sighting.individual_defense, sighting.individual_stamina, sighting.pokemon_level, gender, filter.min_cp_range, filter.max_cp_range);
        let unique_cps = {};

        for(var i = possible_cps.length - 1; i >= 0; i--){
          if(!unique_cps[possible_cps[i].pokemonID]){
            unique_cps[possible_cps[i].pokemonID] = {};
            let pvpRanks = pvp.CalculateTopRanks(MAIN, possible_cps[i].pokemonID, possible_cps[i].formID, filter.max_cp_range);
            let rank = pvpRanks[sighting.individual_attack][sighting.individual_defense][sighting.individual_stamina];
            unique_cps[possible_cps[i].pokemonID].rank = rank.rank;
            unique_cps[possible_cps[i].pokemonID].percent = rank.percent;
            unique_cps[possible_cps[i].pokemonID].level = rank.level;
            unique_cps[possible_cps[i].pokemonID].cp = possible_cps[i].cp;
          }
        }

        unique_cps = pvp.FilterPossibleCPsByRank(unique_cps, filter.min_pvp_rank);
        unique_cps = pvp.FilterPossibleCPsByPercent(unique_cps, filter.min_pvp_percent);

        if(Object.keys(unique_cps).length == 0 ) { return sightingFailed(MAIN, filter, sighting, "CP Range",true); }

        if(!embed){ embed.embed = 'pvp.js'; }
        return Send_PvP.run(MAIN, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, role_id, embed, unique_cps);
      }

      switch(true){
        //------------------------------------------------------------------------------
        // POST WITHOUT IV FILTER
        //------------------------------------------------------------------------------
        case filter.Post_Without_IV:
          switch(true){
            // ONLY BREAK IF UIV IS DISABLED
            case (sighting.cp > 0 && MAIN.config.UIV == 'DISABLED'): break;
            case filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name] == 'False': break;
            default:
              if (!embed) { embed.embed = 'pokemon.js'}
              if (pokemon_channel[1].url) { MAIN.Send_Hook(MAIN, pokemon_channel[1].url,JSON.stringify(sighting),'pokemon'); }
              return Send_Pokemon.run(MAIN, false, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, role_id, embed);
          } break;
        //------------------------------------------------------------------------------
        //  BREAK IF NO CP
        //------------------------------------------------------------------------------
        case !sighting.cp > 0: break;
        //------------------------------------------------------------------------------
        //  BREAK IF POKEMON IS DISABLED OR undefined IN THE FILTER
        //------------------------------------------------------------------------------
        case filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name] == undefined:
          return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] [filtering/pokemon.js] Missing correct filters for '+sighting.pokemon_id+' in '+pokemon_channel[1].filter);
        case filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name] == 'False': break;
        default:
          // INITIATE NEW PASS FILTER FOR EVERY SIGHTING
          let pass = {
            gender: filter.gender == undefined ? 'all' : filter.gender.toLowerCase(),
            size: filter.size == undefined ? 'all' : filter.size.toLowerCase(),

            min_iv: filter.min_iv == undefined ? 0 : filter.min_iv,
            max_iv: filter.max_iv == undefined ? 100 : filter.max_iv,

            min_cp: filter.min_cp == undefined ? 0 : filter.min_cp,
            max_cp: filter.max_cp == undefined ? 10000 : filter.max_cp,

            min_level: filter.min_level == undefined ? 0 : filter.min_level,
            max_level: filter.max_level == undefined ? 35 : filter.max_level
          }
          // DETERMINE GENDER FILTER
          if(filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].gender != undefined){
            pass.gender = filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].gender.toLowerCase();
          }
          // DETERMINE SIZE FILTER
          if(filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].size != undefined){
            pass.size = filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].size.toLowerCase();
          }
          // DETERMINE MIN IV FILTER
          if(filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].min_iv != undefined){
            pass.min_iv = filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].min_iv;
          }
          // DETERMINE MAX IV FILTER
          if(filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].max_iv != undefined){
            pass.max_iv = filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].max_iv;
          }
          // DETERMINE MIN CP FILTER
          if(filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].min_cp != undefined){
            pass.min_cp = filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].min_cp;
          }
          // DETERMINE MAX CP FILTER
          if(filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].max_cp != undefined){
            pass.max_cp = filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].max_cp;
          }
          // DETERMINE MIN LEVEL FILTER
          if(filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].min_level != undefined){
            pass.min_level = filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].min_level;
          }
          // DETERMINE MAX LEVEL FILTER
          if(filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].max_level != undefined){
            pass.max_level = filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name].max_level;
          }
          //------------------------------------------------------------------------------
          //  PUT SIGHTING THROUGH FILTERS
          //------------------------------------------------------------------------------
          switch(true){
            case pass.min_cp > sighting.cp: sightingFailed(MAIN, filter, sighting, 'CP'); break;
            case pass.max_cp < sighting.cp: sightingFailed(MAIN, filter, sighting, 'CP'); break;
            case pass.min_level > sighting.pokemon_level: sightingFailed(MAIN, filter, sighting, 'LEVEL'); break;
            case pass.max_level < sighting.pokemon_level: sightingFailed(MAIN, filter, sighting, 'LEVEL'); break;
            case (pass.size != 'all' && filter.size != sighting.size): sightingFailed(MAIN, filter, sighting, 'SIZE'); break;
            default:
              switch(true){
                //------------------------------------------------------------------------------
                //  INDIVIDUAL VALUE FILTERS (10/10/10)
                //------------------------------------------------------------------------------
                case pass.min_iv.length > 3:
                  // PARSE INDIVUAL VALUES
                  let min_iv = pass.min_iv.split('/');
                  let max_iv = pass.max_iv.split('/');
                  // SEND SIGHTING THROUGH ALL FILTERS
                  switch(true){
                    case min_iv[0] > sighting.individual_attack: sightingFailed(MAIN, filter, sighting, 'IV'); break;
                    case min_iv[1] > sighting.individual_defense: sightingFailed(MAIN, filter, sighting, 'IV'); break;
                    case min_iv[2] > sighting.individual_stamina: sightingFailed(MAIN, filter, sighting, 'IV'); break;
                    case max_iv[0] < sighting.individual_attack: sightingFailed(MAIN, filter, sighting, 'IV'); break;
                    case max_iv[1] < sighting.individual_defense: sightingFailed(MAIN, filter, sighting, 'IV'); break;
                    case max_iv[2] < sighting.individual_stamina: sightingFailed(MAIN, filter, sighting, 'IV');  break;
                    default:
                      if(pass.gender == 'all' || pass.gender == gender){
                        if(!embed){ embed.embed = 'pokemon_iv.js'; }
                        if (pokemon_channel[1].url) { MAIN.Send_Hook(MAIN, pokemon_channel[1].url,JSON.stringify(sighting),'pokemon'); }
                        return Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, role_id, embed);
                      }
                  } break;
                //------------------------------------------------------------------------------
                //  PERCENTAGE FILTER (80%)
                //------------------------------------------------------------------------------
                default:
                  switch(true){
                    case pass.min_iv > internal_value: sightingFailed(MAIN, filter, sighting, 'IV'); break;
                    case pass.max_iv < internal_value: sightingFailed(MAIN, filter, sighting, 'IV'); break;
                    default:
                      if(pass.gender == 'all' || pass.gender == gender){
                        if(!embed){ embed.embed = 'pokemon_iv.js'; }
                        if (pokemon_channel[1].url) { MAIN.Send_Hook(MAIN, pokemon_channel[1].url,JSON.stringify(sighting),'pokemon'); }
                        return Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, role_id, embed);
                      }
                  }
              }
          }
      }
    }
  }); return;
}

function sightingFailed(MAIN, filter, sighting, reason, pvp){
  switch (pvp) {
    case true:
      if(MAIN.debug.PVP == 'ENABLED' && MAIN.debug.Feed == 'ENABLED' && MAIN.debug.Channel == pokemon_channel[0]){
        return console.info(MAIN.Color.blue+'[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [pokemon.js] '+MAIN.masterfile.pokemon[sighting.pokemon_id].name+' failed '+filter.name+' because of '+reason+' check.'+MAIN.Color.reset);
      }
    default:
      if(MAIN.debug.Pokemon == 'ENABLED' && MAIN.debug.Feed == 'ENABLED' && MAIN.debug.Channel == pokemon_channel[0]){
        return console.info(MAIN.Color.cyan+'[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [pokemon.js] '+MAIN.masterfile.pokemon[sighting.pokemon_id].name+' failed '+filter.name+' because of '+reason+' check.'+MAIN.Color.reset);
      }
  }
}
