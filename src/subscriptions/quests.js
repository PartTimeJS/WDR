delete require.cache[require.resolve(__dirname + '/../embeds/quests.js')];

const Send_Quest = require(__dirname + '/../embeds/quests.js');

module.exports = async (WDR, quest, area, server, timezone) => {

  // DEFINE VARIABLES
  let reward = WDR.Get_Quest_Reward(WDR, quest);
  let quest_reward = reward.reward, simple_reward = reward.simple;
  let form_name = reward.form;
  let embed = 'quests.js', content = '';

  if(WDR.config.QUEST.Subscriptions == 'ENABLED'){
    if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Quests == 'ENABLED'){
      console.log(WDR.Color.pink+'[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [quests.js] Received '+quest_reward+' Quest for '+server.name+'.'+WDR.Color.reset);
    }
  } else {
    return questFailed(WDR, quest_reward, server.name, ' Disabled Discord Subscription Setting.');
  }

  // FETCH ALL USERS FROM THE USERS TABLE AND CHECK SUBSCRIPTIONS
 WDR.wdrDB.query(`SELECT * FROM users WHERE guild_id = ? AND status = ?;`, [server.id, 'ACTIVE'], function (error, quest_subs, fields){
    if(quest_subs && quest_subs[0]){
      quest_subs.forEach((user,index) => {
        //FETCH THE GUILD MEMBER AND CHECK IF A ADMINISTRATOR/DONOR
        if(user.discord_id != server.id){return;}
        let member = WDR.Bot.guilds.cache.get(server.id).members.cache.get(user.user_id);
        switch(true){
          case !member:
          case member == undefined: return;
          case WDR.Config.Donor_Check == 'DISABLED': break;
          case !member.roles.cache.has(server.donor_role): return;
        }

        // DEFINE VARIABLES
        let user_areas = user.areas.split(',');

        // CONVERT SUBSCRIBED LIST TO AN ARRAY
        let subs = user.quests ? user.quests.split(',') : '';

        // CHECK IF THE USER HAS SUBS
        if(subs && user.quests_status == 'ACTIVE'){

          // CHECK IF THE REWARD IS ONE THEY ARE SUBSCRIBED TO
          if(subs.indexOf(quest_reward) >= 0 || subs.indexOf(simple_reward) >= 0 || subs.indexOf('ALL') >= 0){

            // CHECK IF THE AREA IS WITHIN THE USER'S GEOFENCES
            if(user.areas == server.name || user_areas.indexOf(area.WDR) >= 0 || user_areas.indexOf(area.sub) >= 0){

              // PREPARE ALERT TO SEND TO USER
              if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Quests == 'ENABLED'){ console.log(WDR.Color.pink+'[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [quests.js] Preparing '+quest_reward+' Quest DM for '+user.user_name+WDR.Color.reset); }
              Send_Quest(WDR, user, quest, quest_reward, simple_reward, area, server, timezone, content, embed);
              return;
            } else{ return questFailed(WDR, quest_reward, user.user_name, 'Area Filters. '+user.areas+' | '+server.name+','+area.WDR+','+area.sub); }
          } else{ return questFailed(WDR, quest_reward, user.user_name, 'Reward Filters'); }
        } else { return; }
      });
    } return;
  });
}

function questFailed(WDR, quest_reward, user_name, reason){
  if(WDR.Debug.Subscriptions == 'ENABLED' && WDR.Debug.Quests == 'ENABLED'){
    console.log('[SUBSCRIPTIONS] ['+WDR.Time(null,'stamp')+'] [quests.js] '+quest_reward+' failed '+user_name+'\'s '+reason+'.');
  }
}
