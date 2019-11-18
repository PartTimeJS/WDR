
const moment = require('moment-timezone');
const Send_Raid = require('../embeds/raids.js');

module.exports = async (MAIN, raid, message, discord, timezone) => {
  // DEFINE GUILD
  let guild = MAIN.guilds.get(discord.id);
  if(!guild){ return; }
  // GET MEMBER
  let member = guild.members.get(message.author.id);
  if(!member){ return; }
  // DEFINE VARIABLES
  let member_count = '1';
  raid.locale = await MAIN.Get_Locale(MAIN, raid, discord);

  // GIVE BOT ENOUGH TIME TO INSERT RAID DATA
  await MAIN.Sleep(1);
  MAIN.pdb.query(`SELECT * FROM active_raids WHERE gym_id = ?`, [raid.gym_id], function (error, record, fields) {
    if(error){ console.error(error); }
    if(record[0]){
      let channel_id = record[0].channel_id ? record[0].channel_id : message.channel.id
      let channel = MAIN.channels.get(channel_id);
      // CHECK IF THE RAID IS ALREADY ACTIVE
      if(record[0].active == 'true'){
        let cmd = MAIN.Commands.get('interested');
        return cmd.run(MAIN, message, record[0], '1');
      } else {

        // SET VARIABLES
        let boss_name = '', type = '', embed = '';
        if(raid.cp > 0 || raid.is_exclusive == true){
          type = 'Boss', embed = 'raids.js';
          boss_name = raid.locale.pokemon_name;
        } else{
          type = 'Egg', embed = 'raid_eggs.js';;
          boss_name = 'Lvl'+raid.level+'-'+type;
        }
        let channel_name = boss_name+'_'+raid.gym_name

        // CREATE THE CHANNEL
        guild.createChannel(channel_name, { type: 'text', }).then( new_channel => {
          let category = discord.raid_lobbies_category_id ? discord.raid_lobbies_category_id : channel.parent;
          // SET THE CATEGORY ID
          new_channel.setParent(category).then( new_channel => {
            new_channel.lockPermissions();
            new_channel.setPosition(0);

            guild.createRole({name: raid.gym_name, mentionable: true}).then(new_role => {

              new_channel.overwritePermissions(new_role, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, EMBED_LINKS: true, ADD_REACTIONS: true, USE_EXTERNAL_EMOJIS: true, ATTACH_FILES: true});

              member.addRole(new_role).then(member => {

                let mention = discord.raid_role ? '<@&'+discord.raid_role+'> ': '';
                mention = member+' has shown interest for a raid in '+record[0].area+' at '+raid.gym_name+'! They are bringing **'+member_count+'**. Make sure to coordinate a start time. '+mention;

                // UPDATE SQL RECORDS
                MAIN.pdb.query(`UPDATE active_raids SET active = ?, channel_id = ?, initiated_by = ?, raid_channel = ?, created = ?, boss_name = ?, role_id = ? WHERE gym_id = ?`,
                [true, channel.id, member.id, new_channel.id, moment().unix(), boss_name, new_role.id, raid.gym_id], function (error, raids, fields) {
                  if(error){ return console.error('[REACTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] Problem updating active_raids',error); }

                  let created_success = new MAIN.Discord.RichEmbed().setColor('00ff00')
                    .setAuthor(member.nickname, member.displayAvatarURL)
                    .setTitle(boss_name+' Raid Lobby Created!')
                    .setDescription(new_channel)
                    .setFooter('Saved to the '+MAIN.config.BOT_NAME+' Database.');
                  message.channel.send(created_success).catch(console.error);
                });
                MAIN.pdb.query(`INSERT INTO lobby_members (gym_id, user_id, count) VALUES (?,?,?) ON DUPLICATE KEY UPDATE count = ?`,
                [raid.gym_id, member.id,member_count,member_count], function (error, lobby, fields) {
                  if(error){ return console.error('[REACTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] Problem inserting lobby_members',error); }
                  Send_Raid.run(MAIN, new_channel, raid, type, record[0].area, record[0].area, record[0].area, discord, timezone, mention, embed)
                });
              });
            });
          });
        });
      }
    }
  });
}
