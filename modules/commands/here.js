const Discord=require('discord.js');

module.exports.run = async (MAIN, message, raids, discord) => {
  guild = MAIN.guilds.get(message.guild.id);
  member = message.author.id;
  channel = raids.raid_channel;
  // RESET LOBBY COUNT
  lobby_count = 0;
  lobby_users = '<@&'+raids.role_id+'>';
  present_users = 0;
  transit_users = 0;

  // CHECK IF USER HAS PREVIOUSLY SHOWN INTEREST
  user_search().then(function(results) {
    if (results === undefined) {
      get_interest();
    }
    else {
      update_status();
      count_members();
    }
  }).catch(function(err){
    console.error();("Promise rejection error: "+err);
  });

  function count_members(){
    // COUNT LOBBY MEMBERS
    MAIN.pdb.query(`SELECT * FROM lobby_members WHERE gym_id = ?`, [raids.gym_id], function (error, lobbys, fields) {
      if(error){ console.error(error);}
      lobbys.forEach(function(lobby) {
        if (lobby.arrived == 'coming') { transit_users += lobby.count; }
        if (lobby.arrived == 'here') { present_users += lobby.count; }
        lobby_count += lobby.count;
      });
      // TAG USER IN EXISTING CHANNEL
      return MAIN.channels.get(channel).send('<@'+member+'> is **at the raid**! There are:```\n'
      +transit_users+' accounts on the way.\n'
      +present_users+' accounts at the raid\n'
      +lobby_count+' total accounts interested```'
      +lobby_users).catch(console.error);
    });
  }

  function user_search(){
    return new Promise( function(resolve, reject){
      MAIN.pdb.query(`SELECT * FROM lobby_members WHERE user_id = ?`, [member], function (error, user, fields) {
        if(fields === undefined){
          reject(new Error("Error fields is undefined"));
        } else { resolve(user[0]); }
      }
    )}
  )
}

function get_interest(){
  // DECLARE VARIABLES
  let nickname = '';

  // GET USER NICKNAME
  if(message.member){
  if(message.member.nickname){ nickname = message.member.nickname; } else{ nickname = message.member.user.username; }
} else{
  nickname = message.author.username;
}

  let addAction = new MAIN.Discord.RichEmbed()
  .setAuthor(nickname, message.author.displayAvatarURL)
  .setTitle('How many accounts are you here with?')
  .setFooter('Reply with a numeral, no command prefix required.');

  message.channel.send(addAction).catch(console.error).then( msg => {
    initiate_interest(MAIN, 'start', message, msg, raids);
  });
}

function update_status(){
  MAIN.pdb.query(`UPDATE lobby_members SET arrived = ? WHERE gym_id = ? && user_id = ?`, ['here',raids.gym_id,member], function (error, lobby, fields) {
    if(error){ console.error(error); }
  });
}

function insert_user(count){
  // ADD ROLE TO MEMBER
  guild.members.get(member).addRole(guild.roles.get(raids.role_id));
  MAIN.pdb.query(`INSERT INTO lobby_members (gym_id, user_id, count, arrived) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE count = ?, arrived = ?`, [raids.gym_id, member,count,'here',count, 'here'], function (error, lobby, fields) {
    if(error){ console.error(error); }
  });
  count_members();
}

async function initiate_interest(MAIN, source, message, msg, raids){
  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.author.id == message.author.id;
  const collector = message.channel.createMessageCollector(filter, { time: 60000 });
  let msg_count = 0;

  // FILTER COLLECT EVENT
  await collector.on('collect', message => {
    let count = message.content;
    collector.stop(count);
  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', (collected,reason) => {

    // DELETE ORIGINAL MESSAGE
    msg.delete();
    switch(reason){
      case 'cancel': break;
      case 'time': if(source == 'start'){
        message.reply('Your response has timed out.').then(m => m.delete(5000)).catch(console.error);
      }
      break;
      default:
      count = parseInt(reason, 10)
      if (Number.isInteger(count) === true){
        if (count === 0){
          let cmd = MAIN.Commands.get('leave');
          return cmd.run(MAIN, message, raids, discord);
        }
        insert_user(count);
        break;
      } else {
        message.reply('Entry is not a number, please retry.').then(m => m.delete(5000)).catch(console.error);
        let cmd = MAIN.Commands.get('coming');
        return cmd.run(MAIN, message, raids, discord);
      }
    } return;
  });
}
}
