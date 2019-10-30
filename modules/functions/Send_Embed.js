// CHOOSE NEXT BOT AND SEND EMBED
module.exports = (MAIN, type, raid_level, server, content, embed, channel_id) => {
  if(!MAIN.BOTS){ return console.error('BOTS aren\'t active or problem finding any BOTS.'); }
  if(!MAIN.Next_Bot){ MAIN.Next_Bot = 0; }
  if(MAIN.Next_Bot == MAIN.BOTS.length-1 && MAIN.BOTS[0]){ MAIN.Next_Bot = 0; } else{ MAIN.Next_Bot++; }
  // GET BOT TO SEND MESSAGE ATTEMPT Next_Bot THEN MAIN IF undefined.
  let bot = MAIN.BOTS[MAIN.Next_Bot].channels.get(channel_id) ? MAIN.BOTS[MAIN.Next_Bot].channels.get(channel_id) : MAIN.channels.get(channel_id);
  if(!bot) { return console.error('Problem finding channel: '+channel_id+' using Bot: '+MAIN.Next_Bot+' '+MAIN.BOTS[MAIN.Next_Bot].user.username); }
	return bot.send(content, embed).then( async message => {
    if(type == 'raid' && raid_level >= server.min_raid_lobbies && MAIN.config.Raid_Lobbies == 'ENABLED' ){
    	await message.react(MAIN.emotes.plusOneReact.id).catch(error => { if(error.code){ return console.error('[REACT] ['+MAIN.Bot_Time(null,'stamp')+'] '+error.code); } else{ return console.error('[REACT] ['+MAIN.Bot_Time(null,'stamp')+'] '+error); } });
    	await message.react(MAIN.emotes.plusTwoReact.id).catch(error => { if(error.code){ return console.error('[REACT] ['+MAIN.Bot_Time(null,'stamp')+'] '+error.code); } else{ return console.error('[REACT] ['+MAIN.Bot_Time(null,'stamp')+'] '+error); } });
    	await message.react(MAIN.emotes.plusThreeReact.id).catch(error => { if(error.code){ return console.error('[REACT] ['+MAIN.Bot_Time(null,'stamp')+'] '+error.code); } else{ return console.error('[REACT] ['+MAIN.Bot_Time(null,'stamp')+'] '+error); } });
    	await message.react(MAIN.emotes.plusFourReact.id).catch(error => { if(error.code){ return console.error('[REACT] ['+MAIN.Bot_Time(null,'stamp')+'] '+error.code); } else{ return console.error('[REACT] ['+MAIN.Bot_Time(null,'stamp')+'] '+error); } });
    	await message.react(MAIN.emotes.cancelReact.id).catch(error => { if(error.code){ return console.error('[REACT] ['+MAIN.Bot_Time(null,'stamp')+'] '+error.code); } else{ return console.error('[REACT] ['+MAIN.Bot_Time(null,'stamp')+'] '+error); } });
    }
  }).catch( error => {
    if(error.code == 'ECONNRESET'){
      return console.error('[Send_Embed] ['+MAIN.Bot_Time(null,'stamp')+'] ['+channel_id+'] Error Code '+error.code);
    } else {
      return console.error('[Send_Embed] ['+MAIN.Bot_Time(null,'stamp')+'] ['+channel_id+'] ['+MAIN.BOTS[MAIN.Next_Bot]+'] '+error);
    }
  });
  return;
}
