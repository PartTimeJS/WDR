const Discord=require('discord.js');

module.exports.run = async (MAIN, message, raids, count) => {
  // HANDLE CHANNEL COMMANDS
  try {
    guild = MAIN.guilds.get(message.guild.id);
    member = message.author.id;
  }
  // HANDLE EMOJI REACTIONS
  catch(e) {
    guild = MAIN.guilds.get(message.d.guild_id);
    member = message.d.user_id
  }
  channel = raids.raid_channel;
  // RESET LOBBY COUNT
  lobby_count = 0;
  lobby_users = '<@&'+raids.role_id+'>';
  present_users = 0;
  transit_users = 0;
  member_count = 0;
  interest = ' has *left* the raid. ';

  // SEARCH FOR USER IN lobby_members
  const user_search = function(){
    return new Promise( function(resolve, reject){
      MAIN.pdb.query(`SELECT * FROM lobby_members WHERE user_id = ?`, [member], function (error, user, fields) {
              if(user === undefined || fields === undefined){
                reject(new Error("Error fields is undefined"));
              } else{
                resolve(user[0]);
              }
          }
      )}
  )}

  // IF USER HAS NOT PREVIOUSLY SHOWN INTEREST, IGNORE
  user_search().then(function(results){
  if (results === undefined) {
    return MAIN.channels.get(channel).send('<@'+member+'> You have not expressed interest in this raid, no need to leave.').catch(console.error);
  } else {
    // REMOVE ROLE AND DELETE FROM lobby_members
    guild.members.get(member).removeRole(guild.roles.get(raids.role_id));
    MAIN.pdb.query(`DELETE FROM lobby_members WHERE user_id = ?`, [member], function (error, lobby, fields) {
      if(error){ console.error(error); }
    });
    MAIN.pdb.query(`SELECT * FROM lobby_members WHERE gym_id = ?`, [raids.gym_id], function (error, lobby, fields) {
      if(error){ console.error(error);}
      // COUNT LOBBY MEMBERS
      lobby.forEach(function(lobby) {
        if (lobby.user_id == member) { member_count = lobby.count; }
        if (lobby.arrived == 'here') { present_users += lobby.count; }
        if (lobby.arrived == 'coming') { transit_users += lobby.count; }
        lobby_count += lobby.count;
      });
    return MAIN.channels.get(channel).send('<@'+member+'>'+interest+'There are:\n```\n'+transit_users+' accounts on the way.\n'+present_users+' accounts at the raid\n'+lobby_count+' total accounts interested```'+lobby_users).catch(console.error);
    });
  }
}).catch(function(err){
 console.error();(err);
 });
}
