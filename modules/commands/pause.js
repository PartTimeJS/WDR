const Discord=require('discord.js');

module.exports.run = async (MAIN, message, prefix, discord) => {
  MAIN.pdb.query(`UPDATE users SET status = ? WHERE user_id = ? AND discord_id = ?`, ['PAUSED', message.author.id, discord.id], function (error, user, fields) {
    if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(15000)).catch(console.error); }
    else{ return message.reply('All of your subscriptions are now `PAUSED`.').then(m => m.delete(15000)).catch(console.error); }
  });
}
