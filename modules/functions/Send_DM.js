// CHOOSE NEXT BOT AND SEND EMBED
module.exports = (MAIN, guild_id, user_id, embed, bot) => {
  if(!MAIN.BOTS[bot]) { bot = 0; }
  MAIN.BOTS[bot].guilds.get(guild_id).fetchMember(user_id).then( TARGET => {
    return TARGET.send(embed).catch( error => {
      if(error.code == 'ECONNRESET'){
        return console.error('[Send_DM] ['+MAIN.Bot_Time(null,'stamp')+'] ['+user_id+'] Error Code ',error.code);
      }else{
        return console.error('[Send_DM] ['+MAIN.Bot_Time(null,'stamp')+'] ['+user_id+'] ['+MAIN.BOTS[bot].id+'] ',error);
      }
    });
  });
  return;
}
