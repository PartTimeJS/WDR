const Send_PvP = require(__dirname + '/../embeds/pvp.js');
const pvp = require(__dirname + '/../pvp.js');

module.exports.run = async (MAIN, sighting, area, server, timezone, role_id) => {

  // IF RUNNING UIV AND POKEMON DOESN'T HAVE IV WAIT UNTIL IT IS RESET BY RDM IF/WHEN IT GETS IV CHECKED
  if(MAIN.config.UIV != 'DISABLED' && !sighting.cp) { return; }

  /// DON'T FILTER IF FEEDS ARE DISABLED
  if(MAIN.config.PVP.Discord_Feeds != 'ENABLED'){ return; }
  

  // VARIABLES
  let internal_value = (sighting.individual_defense+sighting.individual_stamina+sighting.individual_attack)/45;
  let time_now = new Date().getTime(); internal_value = Math.floor(internal_value*1000)/10;

  // CHECK ALL FILTERS
  MAIN.PVP_Channels.forEach((pvp_channel,index) => {

    // DEFINE FILTER VARIABLES   
    let geofences = pvp_channel[1].geofences.split(',');
    let channel = MAIN.channels.cache.get(pvp_channel[0]);
    let filter = MAIN.Filters.get(pvp_channel[1].filter);
    let embed = pvp_channel[1].embed ? pvp_channel[1].embed : 'pvp.js';
    let role_id = '';

    // CHECK FOR INVALID DATA
    if(!filter){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The filter defined for '+pvp_channel[0]+' does not appear to exist.'); }
    if(!channel){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The channel '+pvp_channel[0]+' does not appear to exist.'); }
    if(filter.Type != 'pvp'){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The filter defined for '+pvp_channel[0]+' does not appear to be a pvp filter.'); }

    // ADD ROLE ID IF IT EXISTS
    if(pvp_channel[1].roleid){
      if(pvp_channel[1].roleid == 'here' || pvp_channel[1].roleid == 'everyone'){
        role_id = '@'+pvp_channel[1].roleid;
      } else{
        role_id = '<@&'+pvp_channel[1].roleid+'>';
      }
    }

    // CHECK FILTER GEOFENCES
    if(geofences.indexOf(server.name) >= 0 || geofences.indexOf(area.main) >= 0 || geofences.indexOf(area.sub) >= 0){

      if(!sighting.cp) { return };
      if(sighting.cp > filter.max_cp_range) { return; }
      if(filter[MAIN.masterfile.pokemon[sighting.pokemon_id].name] != 'True'){ return; }      
      let unique_cps = {};

      let league = filter.league + "_league";
  
      for(let i = 0; i < sighting[league].length; i++){
        if(sighting[league][i].percent >= filter.min_pvp_percent && sighting[league][i].rank <= filter.min_pvp_rank && sighting[league][i].cp >= filter.min_cp_range)
        {
          if(!unique_cps[sighting[league][i].pokemon_id]) { unique_cps[sighting[league][i].pokemon_id] = {}; }          
          unique_cps[sighting[league][i].pokemon_id].rank = sighting[league][i].rank;
          unique_cps[sighting[league][i].pokemon_id].percent = sighting[league][i].percent;
          unique_cps[sighting[league][i].pokemon_id].level = sighting[league][i].level;
          unique_cps[sighting[league][i].pokemon_id].cp = sighting[league][i].cp;
          unique_cps[sighting[league][i].pokemon_id].value = sighting[league][i].pvp_value;
          unique_cps[sighting[league][i].pokemon_id].form_id = sighting[league][i].form_id;
        }
      }

      if(Object.keys(unique_cps).length == 0 ) { return; }

      return Send_PvP.run(MAIN, channel, sighting, internal_value, time_now, area, server, timezone, role_id, embed, unique_cps);
    }
  }); return;
}
