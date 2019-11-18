const Send_Quest = require('../embeds/quests.js');


module.exports.run = async (MAIN, quest, area, server, timezone, role_id) => {

  // DETERMINE THE QUEST REWARD
  let reward = MAIN.Get_Quest_Reward(MAIN, quest);
  let quest_reward = reward.reward, simple_reward = reward.simple, form_name = reward.form;

  if(MAIN.config.QUEST.Discord_Feeds == 'ENABLED'){
    if(MAIN.debug.Quests == 'ENABLED' && MAIN.debug.Feed == 'ENABLED'){ console.info(MAIN.Color.green+'[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [quests.js] Received '+quest_reward+' Quest for '+server.name+'.'+MAIN.Color.reset); }
  } else{
    if(MAIN.debug.Quests == 'ENABLED' && MAIN.debug.Feed == 'ENABLED'){ console.info(MAIN.Color.green+'[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [quests.js] '+quest_reward+' Quest ignored due to Disabled Discord Feed Setting.'+MAIN.Color.reset); }
    return;
  }

  // CHECK ALL FILTERS
  MAIN.Quest_Channels.forEach((quest_channel,index) => {

    // DEFINE MORE VARIABLES
    let embed = quest_channel[1].embed ? quest_channel[1].embed : 'quests.js';
    let geofences = quest_channel[1].geofences.split(',');
    let channel = MAIN.channels.get(quest_channel[0]);
    let filter = MAIN.Filters.get(quest_channel[1].filter);
    let role_id = '';

    // THROW ERRORS FOR INVALID DATA
    if(!filter){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The filter defined for '+quest_channel[0]+' does not appear to exist.'); }
    if(!channel){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The channel '+quest_channel[0]+' does not appear to exist.'); }
    if(filter.Type != 'quest'){ return console.error('['+MAIN.config.BOT_NAME+'] ['+MAIN.Bot_Time(null,'stamp')+'] The filter defined for '+quest_channel[0]+' does not appear to be a quest filter.'); }

    if (quest_channel[1].roleid) {
      if (quest_channel[1].roleid == 'here' || quest_channel[1].roleid == 'everyone'){
        role_id = '@'+quest_channel[1].roleid;
      } else {
        role_id = '<@&'+quest_channel[1].roleid+'>';
      }
    }

    // AREA FILTER
    if(geofences.indexOf(server.name)>=0 || geofences.indexOf(area.main)>=0 || geofences.indexOf(area.sub)>=0){

      // REWARD FILTER
      if(filter.Rewards.indexOf(quest_reward) >= 0 || filter.Rewards.indexOf(simple_reward) >= 0 || filter.Rewards.indexOf('ALL') >= 0){

        // PREPARE AND SEND TO DISCORDS
        return Send_Quest.run(MAIN, channel, quest, quest_reward, simple_reward, area, server, timezone, role_id, embed);
      } else{ questFailed(MAIN, quest_reward, channel.name, 'Reward Filter'); }
    } else{ questFailed(MAIN, quest_reward, channel.name, 'Area Filter'); }
  });
}

function questFailed(MAIN, quest_reward, destination, reason){
  if(MAIN.debug.Feed == 'ENABLED' && MAIN.debug.Quests == 'ENABLED'){
    console.info('[FILTERING] ['+MAIN.Bot_Time(null,'stamp')+'] [quests.js] '+quest_reward+' failed '+destination+' '+reason+'.');
  }
}
