const Send_Quest = require(__dirname + '/../embeds/quests.js');

module.exports.run = async (MAIN, quest, area, server, timezone, role_id) => {

  let quest_reward = 'NO REWARD SET', simple_reward = 'NO REWARD SET';

  let pokemon_name = quest.locale.pokemon_name, form_name = quest.locale.form;

  let reward_type = MAIN.quest_rewards[quest.rewards[0].type].text;

  switch(reward_type){
    case "Unset":
      return console.error("UNSET QUEST", quest);
    case "Experience points":
      return console.error("EXPERIENCE QUEST", quest);

    // ITEM REWARDS (EXCEPT STARDUST)
    case "Items":
      let item_reward = MAIN.items[quest.rewards[0].info.item_id].name;
      let amount = quest.rewards[0].info.amount;

      if(quest.rewards[0].info.amount > 1){
        if(quest_reward.indexOf('Berry') >= 0){ quest_reward = quest_reward.toString().slice(0,-1)+'ies'; }
        else{ quest_reward = quest_reward+'s'; }
      }

      simple_reward = MAIN.masterfile.item[quest.rewards[0].info.item_id];
      quest_reward = quest.rewards[0].info.amount+' '+MAIN.masterfile.item[quest.rewards[0].info.item_id];
      if(quest.rewards[0].info.amount > 1){
        if(quest_reward.indexOf('Berry') >= 0){ quest_reward = quest_reward.toString().slice(0,-1)+'ies'; }
        else{ quest_reward = quest_reward+'s'; }
      } break;

    // STARDUST REWARD
    case "Stardust":
      quest_reward = quest.rewards[0].info.amount+' Stardust'; break;

    case "Candy":
      return console.error("CANDY QUEST", quest);

    case "Avatar clothing":
      return console.error("AVATAR CLOTHING QUEST", quest);

    case "Quest": console.error('NO REWARD SET. REPORT THIS TO THE DISCORD ALONG WITH THE FOLLOWING:',quest); break;

    // ENCOUNTER REWARDS
    case "Pokémon encounter":
      simple_reward = pokemon_name;
      quest_reward = pokemon_name+' '+form_name+'Encounter'; break;
      if(quest.rewards[0].info.shiny == true){
        simple_reward = 'Shiny '+simple_reward;
        quest_reward = 'Shiny '+quest_reward;
      } break;
  }

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
    let channel = MAIN.channels.cache.get(quest_channel[0]);
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
