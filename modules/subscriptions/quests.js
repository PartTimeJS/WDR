delete require.cache[require.resolve('../embeds/quests.js')];

const Send_Quest = require('../embeds/quests.js');

module.exports.run = async (MAIN, quest, area, server, timezone) => {

  // DEFINE VARIABLES
  let reward = MAIN.Get_Quest_Reward(MAIN, quest);
  let quest_reward = reward.reward, simple_reward = reward.simple;
  let form_name = reward.form;
  let embed = 'quests.js', content = '';

  if(MAIN.config.QUEST.Subscriptions == 'ENABLED'){
    if(MAIN.debug.Subscriptions == 'ENABLED' && MAIN.debug.Quests == 'ENABLED'){
      console.info(MAIN.Color.pink+'[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [quests.js] Received '+quest_reward+' Quest for '+server.name+'.'+MAIN.Color.reset);
    }
  } else {
    return questFailed(MAIN, quest_reward, server.name, ' Disabled Discord Subscription Setting.');
  }

  // FETCH ALL USERS FROM THE USERS TABLE AND CHECK SUBSCRIPTIONS
  MAIN.pdb.query(`SELECT * FROM users WHERE discord_id = ? AND status = ?;`, [server.id, 'ACTIVE'], function (error, quest_subs, fields){
    if(quest_subs && quest_subs[0]){
      quest_subs.forEach((user,index) => {
        //FETCH THE GUILD MEMBER AND CHECK IF A ADMINISTRATOR/DONOR
        if(user.discord_id != server.id){return;}
        let member = MAIN.guilds.get(server.id).members.get(user.user_id);
        switch(true){
          case !member:
          case member == undefined: return;
          case MAIN.config.Donor_Check == 'DISABLED': break;
          case !member.roles.has(server.donor_role): return;
        }

        // DEFINE VARIABLES
        let user_areas = user.geofence.split(',');

        // CONVERT SUBSCRIBED LIST TO AN ARRAY
        let subs = user.quests ? user.quests.split(',') : '';

        // CHECK IF THE USER HAS SUBS
        if(subs && user.quests_status == 'ACTIVE'){

          // CHECK IF THE REWARD IS ONE THEY ARE SUBSCRIBED TO
          if(subs.indexOf(quest_reward) >= 0 || subs.indexOf(simple_reward) >= 0 || subs.indexOf('ALL') >= 0){

            // CHECK IF THE AREA IS WITHIN THE USER'S GEOFENCES
            if(user.geofence == server.name || user_areas.indexOf(area.main) >= 0 || user_areas.indexOf(area.sub) >= 0){

              // PREPARE ALERT TO SEND TO USER
              if(MAIN.debug.Subscriptions == 'ENABLED' && MAIN.debug.Quests == 'ENABLED'){ console.info(MAIN.Color.pink+'[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [quests.js] Preparing '+quest_reward+' Quest DM for '+user.user_name+MAIN.Color.reset); }
              Send_Quest.run(MAIN, user, quest, quest_reward, simple_reward, area, server, timezone, content, embed);
              return;
            } else{ return questFailed(MAIN, quest_reward, user.user_name, 'Area Filters. '+user.geofence+' | '+server.name+','+area.main+','+area.sub); }
          } else{ return questFailed(MAIN, quest_reward, user.user_name, 'Reward Filters'); }
        } else { return; }
      });
    } return;
  });
}

function questFailed(MAIN, quest_reward, user_name, reason){
  if(MAIN.debug.Subscriptions == 'ENABLED' && MAIN.debug.Quests == 'ENABLED'){
    console.info('[SUBSCRIPTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [quests.js] '+quest_reward+' failed '+user_name+'\'s '+reason+'.');
  }
}
