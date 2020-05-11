const Send_Pokemon = require(__dirname + '/../embeds/pokemon.js');


module.exports.run = async (MAIN, sighting, area, server, timezone, role_id) => {


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
    let channel = MAIN.channels.cache.get(pokemon_channel[0]);
    let filter = MAIN.Filters.get(pokemon_channel[1].filter);
    let target = filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name];
    let role_id = '', embed = '';

    // DETERMINE GENDER
    switch(sighting.gender){
      case 1: gender = 'male'; break;
      case 2: gender = 'female'; break;
      default: gender = 'all';
    }

    // CHECK FOR INVALID DATA
    if(!filter){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The filter defined for '+pokemon_channel[0]+' does not appear to exist.'); }
    if(!channel){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The channel '+pokemon_channel[0]+' does not appear to exist.'); }
    if(filter.Type != 'pokemon'){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The filter defined for '+pokemon_channel[0]+' does not appear to be a pokemon filter.'); }

    // ADD ROLE ID IF IT EXISTS
    if(pokemon_channel[1].roleid){
      if(pokemon_channel[1].roleid == 'here' || pokemon_channel[1].roleid == 'everyone'){
        role_id = '@'+pokemon_channel[1].roleid;
      } else{
        role_id = '<@&'+pokemon_channel[1].roleid+'>';
      }
    }

    // CHECK FILTER GEOFENCES
    if(geofences.indexOf(server.name) >= 0 || geofences.indexOf(area.main) >= 0 || geofences.indexOf(area.sub) >= 0){

      // FRESH FILTER CRITERIA
      let criteria = {};

      criteria.gender = (filter.gender == undefined ? "all" : filter.gender).toLowerCase();
      criteria.size = (filter.size == undefined ? "all" : filter.size).toLowerCase();
      criteria.min_iv = filter.min_iv == undefined ? 0 : filter.min_iv;
      criteria.max_iv = filter.max_iv == undefined ? 100 : filter.max_iv;
      criteria.min_cp = filter.min_cp == undefined ? 1 : filter.min_cp;
      criteria.max_cp = filter.max_cp == undefined ? 10000 : filter.max_cp;
      criteria.min_level = filter.min_level == undefined ? 0 : filter.min_level;
      criteria.max_level = filter.max_level == undefined ? 35 : filter.max_level;

      switch(true){

        // POST WITHOUT IV FILTER
        case filter.Post_Without_IV:
          switch(true){

            // ONLY BREAK IF UIV IS DISABLED
            case (sighting.cp > 0 && MAIN.config.UIV == 'DISABLED'): break;
            case target == 'False': break;
            default:
              embed = pokemon_channel[1].embed ? pokemon_channel[1].embed : 'pokemon.js';
              return Send_Pokemon.run(MAIN, false, channel, sighting, internal_value, time_now, area, server, timezone, role_id, embed);
          } break;

        //  BREAK IF NO CP
        case !sighting.cp > 0: break;

        //  BREAK IF POKEMON IS DISABLED OR undefined IN THE FILTER
        case target == undefined:
          return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] [filtering/pokemon.js] Missing correct filters for '+sighting.pokemon_id+' in '+pokemon_channel[1].filter);
        case target == 'False': break;
        case Object.prototype.toString.call(target) === "[object Object]":

          //  FILTER BY INDIVIDUAL VALUES
          criteria.gender = target.gender == undefined ? criteria.gender : target.gender;
          criteria.size = target.size == undefined ? criteria.size : target.size;
          criteria.min_iv = target.min_iv == undefined ? criteria.min_iv : target.min_iv;
          criteria.max_iv = target.max_iv == undefined ? criteria.max_iv : target.max_iv;
          criteria.min_cp = target.min_cp == undefined ? criteria.min_cp : target.min_cp;
          criteria.max_cp = target.max_cp == undefined ? criteria.max_cp : target.max_cp;
          criteria.min_level = target.min_level == undefined ? criteria.min_level : target.min_level;
          criteria.max_level = target.max_level == undefined ? criteria.max_level : target.max_level;

          //  PUT SIGHTING THROUGH FILTERS
          switch(true){
            case criteria.min_cp > sighting.cp: break;
            case criteria.max_cp < sighting.cp: break;
            case criteria.min_level > sighting.pokemon_level: break;
            case criteria.max_level < sighting.pokemon_level: break;
            case (criteria.size != 'all' && criteria.size != sighting.size): break;
            default:
              switch(true){

                //  INDIVIDUAL VALUE FILTERS (10/10/10)
                case criteria.min_iv.length > 3:

                  //  PARSE INDIVUAL VALUES
                  let min_iv = criteria.min_iv.split('/');
                  let max_iv = criteria.max_iv.split('/');

                  //  SEND SIGHTING THROUGH ALL FILTERS
                  switch(true){
                    case min_iv[0] > sighting.individual_attack: break;
                    case min_iv[1] > sighting.individual_defense: break;
                    case min_iv[2] > sighting.individual_stamina: break;
                    case max_iv[0] < sighting.individual_attack: break;
                    case max_iv[1] < sighting.individual_defense: break;
                    case max_iv[2] < sighting.individual_stamina: break;
                    default:
                      if(criteria.gender == 'all' || criteria.gender == gender){
                        return Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, area, server, timezone, role_id, embed);
                      } else { return; }
                  } break;

                //  PERCENTAGE FILTER (80%)
                default:
                  switch(true){
                    case criteria.min_iv > internal_value: break;
                    case criteria.max_iv < internal_value: break;
                    default:
                      if(criteria.gender == 'all' || criteria.gender == gender){
                        embed = pokemon_channel[1].embed ? pokemon_channel[1].embed : 'pokemon_iv.js';
                        return Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, area, server, timezone, role_id, embed);
                      } else { return; }
                  }
              }
          }
        //------------------------------------------------------------------------------
        //  FILTER BY FILTER DEFAULTS
        //------------------------------------------------------------------------------
        default:

          //  PUT SIGHTING THROUGH FILTERS
          switch(true){
            case criteria.min_cp > sighting.cp: break;
            case criteria.max_cp < sighting.cp: break;
            case criteria.min_level > sighting.pokemon_level: break;
            case criteria.max_level < sighting.pokemon_level: break;
            case (criteria.size != 'all' && criteria.size != sighting.size): break;
            default:
              switch(true){

                //  INDIVIDUAL VALUE FILTERS (10/10/10)
                case criteria.min_iv.length > 3:

                  //  PARSE INDIVUAL VALUES
                  let min_iv = criteria.min_iv.split('/');
                  let max_iv = criteria.max_iv.split('/');

                  //  SEND SIGHTING THROUGH ALL FILTERS
                  switch(true){
                    case min_iv[0] > sighting.individual_attack: break;
                    case min_iv[1] > sighting.individual_defense: break;
                    case min_iv[2] > sighting.individual_stamina: break;
                    case max_iv[0] < sighting.individual_attack: break;
                    case max_iv[1] < sighting.individual_defense: break;
                    case max_iv[2] < sighting.individual_stamina: break;
                    default:
                      if(criteria.gender == 'all' || criteria.gender == gender){
                        return Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, area, server, timezone, role_id, embed);
                      } else { return; }
                  } break;

                //  PERCENTAGE FILTER (80%)
                default:
                  switch(true){
                    case criteria.min_iv > internal_value: break;
                    case criteria.max_iv < internal_value: break;
                    default:
                      if(criteria.gender == 'all' || criteria.gender == gender){
                        embed = pokemon_channel[1].embed ? pokemon_channel[1].embed : 'pokemon_iv.js';
                        return Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, area, server, timezone, role_id, embed);
                      } else { return; }
                  }
              }
          }


      }
    }
  }); return;
}
