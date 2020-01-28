// CHOOSE NEXT BOT AND SEND EMBED
module.exports = (MAIN, type, raid_level, server, content, embed, channel_id) => {

  if(!MAIN.BOTS){ return console.error('BOTS aren\'t active or problem finding any BOTS.'); }

  if(!MAIN.Next_Bot){ MAIN.Next_Bot = 0; }
  if(MAIN.Next_Bot == MAIN.BOTS.length-1 && MAIN.BOTS[0]){ MAIN.Next_Bot = 0; } else{ MAIN.Next_Bot++; }
  let channel = MAIN.BOTS[MAIN.Next_Bot].channels.get(channel_id);
  if(!channel) { return console.error('Problem finding channel: '+channel_id+' using Bot: '+MAIN.Next_Bot); }
	return channel.send(content, embed).catch( error => {
    return console.error('[Send_Embed] ['+MAIN.Bot_Time(null,'stamp')+'] ['+channel_id+']', error);
  });
  return;
}
