
const Embed_Config = require('../../embeds/raids.js');
const Embed_EggConfig = require('../../embeds/raid_eggs.js');
const moment = require('moment-timezone');

const reactions = {
  "interval": 60000
};
reactions.run = (MAIN, event) => {
  let guild = MAIN.guilds.get(event.d.guild_id);
  let member = guild.members.get(event.d.user_id);
  let channel = MAIN.channels.get(event.d.channel_id);
  let user_list = '', discord = '';
  let lobby_count = 0;
  let lobby_users = '';
  if(!member.user.bot && (event.d.emoji.id == MAIN.emotes.plusOneReact.id || event.d.emoji.id == MAIN.emotes.plusTwoReact.id || event.d.emoji.id == MAIN.emotes.plusThreeReact.id || event.d.emoji.id == MAIN.emotes.plusFourReact.id || event.d.emoji.id == MAIN.emotes.plusFiveReact.id || event.d.emoji.id == MAIN.emotes.cancelReact.id) ){

    let member_count = 0;
    if (event.d.emoji.id == MAIN.emotes.plusOneReact.id) { member_count = 1; }
    if (event.d.emoji.id == MAIN.emotes.plusTwoReact.id) { member_count = 2; }
    if (event.d.emoji.id == MAIN.emotes.plusThreeReact.id) { member_count = 3; }
    if (event.d.emoji.id == MAIN.emotes.plusFourReact.id) { member_count = 4; }
    if (event.d.emoji.id == MAIN.emotes.plusFiveReact.id) { member_count = 5; }
    if (event.d.emoji.id == MAIN.emotes.cancelReact.id) { member_count = 0; }

    // FETCH CHANNEL
    channel.fetchMessage(event.d.message_id).then( async raid => {
      let gym_id = raid.embeds[0].footer.text;

      await MAIN.Discords.Servers.forEach( async (server,index) => {
        if(server.id == guild.id){ discord = server; }
      });

      MAIN.pdb.query(`SELECT * FROM active_raids WHERE gym_id = ?`, [gym_id], function (error, record, fields) {
        if(error){ console.error(error); }
        else if(record[0]){

          // CHECK FOR ABUSE
          MAIN.pdb.query(`SELECT * FROM active_raids WHERE initiated_by = ? AND created > UNIX_TIMESTAMP()-900`, [member.id], function (error, posts, fields) {
            if(posts && posts.length >= MAIN.config.Lobby_Limit){
              guild.fetchMember(event.d.user_id).then( TARGET => {
                return TARGET.send('You have have attempted to create too many raid lobbies in a short amount of time. Please only react to raids you can actually make it to and are seriously interested in.').catch(console.error);
              });
            } else{

              // CHECK IF THE RAID IS ALREADY ACTIVE
              if(record[0].active == 'true'){
                let cmd = MAIN.Commands.get('interested');
                if (member_count == 0) {
                  cmd = MAIN.Commands.get('leave');
                  }
                cmd.run(MAIN, event, record[0], member_count);
                  if(error){ console.error(error);}
              } else {
                if (member_count == 0){
                  guild.fetchMember(event.d.user_id).then( TARGET => {
                    return TARGET.send('You\'ve attempted to leave a raid with no lobby, if this was a mistake try again.').catch(console.error);
                  });
                } else {
                  // SET THE CHANNEL NAME
                  let gym = JSON.parse(record[0].embed);
                  let boss_name = gym.boss;
                  if (boss_name == 'Egg') {
                    boss_name = 'Level'+gym.level+'_'+boss_name;
                  }
                  let channel_name = boss_name+'_'+record[0].gym_name

                // CREATE THE CHANNEL
                guild.createChannel(channel_name, { type: 'text', }).then( new_channel => {
                  let category = discord.raid_lobbies_category_id ? discord.raid_lobbies_category_id : channel.parent;
                  // SET THE CATEGORY ID
                  new_channel.setParent(category).then( new_channel => {
                  new_channel.lockPermissions();
                  new_channel.setPosition(0);

                    guild.createRole({name: record[0].gym_name, mentionable: true}).then(new_role => {

                    new_channel.overwritePermissions(new_role,  {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, EMBED_LINKS: true, ADD_REACTIONS: true, USE_EXTERNAL_EMOJIS: true, ATTACH_FILES: true});

                    channel_id = new_channel.id;

                    time_now = new Date().getTime();
                    gym.hatch_mins = Math.floor((gym.start-(time_now/1000))/60);
                    gym.end_mins = Math.floor((gym.end-(time_now/1000))/60);

                    if (gym.boss == 'Egg') {
                      channel_embed = Embed_EggConfig(gym);
                      channel_embed.setFooter(gym.id);
                    } else {
                      channel_embed = Embed_Config(gym);
                      channel_embed.setFooter(gym.id);
                    }

                    member.addRole(new_role).then(member => {

                    let mention = discord.raid_role ? '<@&'+discord.raid_role+'> ': '';
                    new_channel.send(member+' has shown interest for a raid in '+record[0].area+' at '+record[0].gym_name+'! They are bringing **'+member_count+'**. Make sure to coordinate a start time. '+mention, channel_embed)
                    .then( message => {
                      message.react(MAIN.emotes.plusOneReact.id).catch(error).then( reaction => {
                      message.react(MAIN.emotes.plusTwoReact.id).catch(error).then( reaction => {
                      message.react(MAIN.emotes.plusThreeReact.id).catch(error).then( reaction => {
                      message.react(MAIN.emotes.plusFourReact.id).catch(error).then( reaction => {
                      message.react(MAIN.emotes.cancelReact.id).catch(error) }) }) }) })
                    }).catch(error => {
                      if(error){
                        if(error.code === 'ECONNRESET'){
                          return console.error('[REACTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] Problem with adding reactions timeout: ',error.code);
                        }else{
                          return console.error('[REACTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] Problem with adding reactions: ',error);
                        }
                      }
                    });
                    // UPDATE SQL RECORDS
                    MAIN.pdb.query(`UPDATE active_raids SET active = ?, channel_id = ?, initiated_by = ?, raid_channel = ?, created = ?, boss_name = ?, role_id = ? WHERE gym_id = ?`, ['true', channel.id, member.id, channel_id, moment().unix(), gym.boss, new_role.id, gym.id], function (error, raids, fields) {
                      if(error){ return console.error('[REACTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] Problem updating active_raids',error); }
                    });
                    MAIN.pdb.query(`INSERT INTO lobby_members (gym_id, user_id, count) VALUES (?,?,?) ON DUPLICATE KEY UPDATE count = ?`, [gym.id, member.id,member_count,member_count], function (error, lobby, fields) {
                      if(error){ return console.error('[REACTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] Problem inserting lobby_members',error); }
                    });
                  });
                });
              });
            });}
              }
            }
          });
        } else{
          guild.fetchMember(event.d.user_id).then( TARGET => {
            return TARGET.send('Unable to create an Active Raid for '+raid.embeds[0].author.name+'. That Raid appears to have expired!').catch(console.error);
          });
        }
      });
    }); return;
  }
}

function getActiveRaids(MAIN){
  return new Promise(function(resolve, reject) {
    MAIN.pdb.query(`SELECT * FROM active_raids WHERE active = ?`, ['true'], function (error, raids, fields) { return resolve(raids); });
  });
}

reactions.startInterval = async (MAIN) => {
  if(MAIN.config.Raid_Lobbies == 'ENABLED'){
    let active_raids = await getActiveRaids(MAIN);
    setInterval(async function() {
      if(!active_raids){ return; }
      await active_raids.forEach((active,index) => {
        MAIN.pdb.query(`SELECT * FROM active_raids WHERE gym_id = ? AND active = ?`, [active.gym_id, 'true'], function (error, record, fields) {
          if(!record){ return; }
          if(record[0] && active.embed != record[0].embed){

            let gym = JSON.parse(record[0].embed);
            let boss_name = gym.boss;
            let channel_name = boss_name+'_'+record[0].gym_name

            time_now = new Date().getTime();
            gym.hatch_mins = Math.floor((gym.start-(time_now/1000))/60);
            gym.end_mins = Math.floor((gym.end-(time_now/1000))/60);

            if (gym.boss == 'Egg') {
              channel_embed = Embed_EggConfig(gym);
              channel_embed.setFooter(gym.id);
            } else {
              channel_embed = Embed_Config(gym);
              channel_embed.setFooter(gym.id);
            }

            MAIN.channels.get(record[0].raid_channel).setName(boss_name+'_'+record[0].gym_name).catch(console.error);

            MAIN.channels.get(record[0].raid_channel).send(channel_embed)
            .then( message => {
                   message.react(MAIN.emotes.plusOneReact.id).catch(error).then( reaction => {
                   message.react(MAIN.emotes.plusTwoReact.id).catch(error).then( reaction => {
                   message.react(MAIN.emotes.plusThreeReact.id).catch(error).then( reaction => {
                   message.react(MAIN.emotes.plusFourReact.id).catch(error).then( reaction => {
                   message.react(MAIN.emotes.cancelReact.id).catch(error) }) }) }) })
                    }).catch(error => {
                      if(error){
                        if(error.code === 'ECONNRESET'){
                          return console.error('[REACTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] Problem with adding reactions timeout: ',error.code);
                        }else{
                          return console.error('[REACTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] Problem with adding reactions: ',error);
                        }
                      }
                    });
                  }
                });
              });
              active_raids = await getActiveRaids(MAIN);
            }, 60000);
          } else { return; } // RAID LOBBIES ARE NOT ENABLED
        }

module.exports = reactions;
