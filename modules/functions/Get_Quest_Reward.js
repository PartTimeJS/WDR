const InsideGeojson = require('point-in-geopolygon');

// DETERMINE THE QUEST REWARD
module.exports = (MAIN, quest) => {
  let quest_reward = 'NO REWARD SET', simple_reward = 'NO REWARD SET';
  let pokemon_name = quest.locale.pokemon_name, form_name = quest.locale.form;

  switch(quest.rewards[0].type){
    // PLACEHOLDER
    case 1: console.error('NO REWARD SET. REPORT THIS TO THE DISCORD ALONG WITH THE FOLLOWING:',quest); break;

    // ITEM REWARDS (EXCEPT STARDUST)
    case 2:
      simple_reward = MAIN.proto.values['item_'+quest.rewards[0].info.item_id];
      quest_reward = quest.rewards[0].info.amount+' '+MAIN.proto.values['item_'+quest.rewards[0].info.item_id];
      if(quest.rewards[0].info.amount > 1){
        if(quest_reward.indexOf('Berry') >= 0){ quest_reward = quest_reward.toString().slice(0,-1)+'ies'; }
        else{ quest_reward = quest_reward+'s'; }
      } break;

    // STARDUST REWARD
    case 3:
      simple_reward = quest.rewards[0].info.amount;
      quest_reward = simple_reward+' Stardust'; break;

    case 4: // PLACEHOLDER
    case 5: // PLACEHOLDER
    case 6: console.error('NO REWARD SET. REPORT THIS TO THE DISCORD ALONG WITH THE FOLLOWING:',quest); break;

    // ENCOUNTER REWARDS
    case 7:
      simple_reward = pokemon_name;
      quest_reward = pokemon_name+' '+form_name+'Encounter'; break;
      if(quest.rewards[0].info.shiny == true){
        simple_reward = 'Shiny '+simple_reward;
        quest_reward = 'Shiny '+quest_reward;
      } break;
  }
  return { reward: quest_reward, simple: simple_reward, form: form_name };
}
