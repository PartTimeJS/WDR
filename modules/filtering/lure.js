const Send_Lure = require('../embeds/lure.js');


module.exports.run = async (MAIN, lure, area, server, timezone, role_id) => {

  if(MAIN.debug.Lure == 'ENABLED' && MAIN.debug.Feed == 'ENABLED'){ console.info('[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [lure.js] Received a Pokestop Lure.'); }

  // FILTER FEED TYPE FOR EGG, BOSS, OR BOTH
  let type = MAIN.Get_Lure(MAIN, lure.lure_id), stop_id = lure.pokestop_id;

  // CHECK EACH FEED FILTER
  MAIN.Lure_Channels.forEach((lure_channel,index) => {

    // DEFINE MORE VARIABLES
    let geofences = lure_channel[1].geofences.split(',');
    let channel = MAIN.channels.get(lure_channel[0]);
    let filter = MAIN.Filters.get(lure_channel[1].filter);
    let role_id = '';
    let embed = 'lure.js';

    if (lure_channel[1].roleid) {
      if (lure_channel[1].roleid == 'here' || lure_channel[1].roleid == 'everyone'){
        role_id = '@'+lure_channel[1].roleid;
      } else {
        role_id = '<@&'+lure_channel[1].roleid+'>';
      }
    }

    // IF CHANNEL SPECIFIC LURE EMBED SPECIFIED USE IT
    if (lure_channel[1].embed) { embed = lure_channel[1].embed; }

    // THROW ERRORS AND BREAK FOR INVALID DATA
    if(!filter){ return console.error('[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [lure.js] The filter defined for '+lure_channel[0]+' does not appear to exist.'); }
    if(!channel){ return console.error('[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [lure.js] The channel '+lure_channel[0]+' does not appear to exist.'); }
    if(filter.Type != 'lure'){ return console.error('[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [lure.js] The filter defined for '+lure_channel[0]+' does not appear to be a lure filter.'); }

    // FILTER FOR LURE TYPE
    else if (filter.Lure_Type.indexOf(type) >= 0) {

      // AREA FILTER
      if(geofences.indexOf(server.name) >= 0 || geofences.indexOf(area.main) >= 0 || geofences.indexOf(area.sub) >= 0){
        if(MAIN.debug.Lure == 'ENABLED' && MAIN.debug.Feed == 'ENABLED'){ console.info('[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [lure.js] Lure Passed Filters for '+lure_channel[0]+'.'); }
        Send_Lure.run(MAIN, channel, lure, type, area, server, timezone, role_id, embed);
      }
      else{ if(MAIN.debug.Lure == 'ENABLED' && MAIN.debug.Feed == 'ENABLED'){ console.info('[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [lure.js] Lure Did Not Pass Channel Geofences for '+lure_channel[0]+'. Expected: '+lure_channel[1].geofences+' Saw: '+server.name+'|'+area.main+'|'+area.sub); } }
    } else{ if(MAIN.debug.Lure == 'ENABLED' && MAIN.debug.Feed == 'ENABLED'){ console.info('[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [lure.js] Lure Did Not Meet Type or Level Filter for '+lure_channel[0]+'. Expected: '+filter.Lure_Type+', Saw: '+type.toLowerCase()); } }
  });

}
