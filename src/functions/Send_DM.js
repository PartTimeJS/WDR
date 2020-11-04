// CHOOSE NEXT BOT AND SEND EMBED
module.exports = (WDR, guild_id, user_id, embed, bot) => {
    if (!WDR.Bot.Array[bot]) {
        bot = 0;
    }
    if (bot) {
        WDR.Bot.Array[bot].users.fetch(user_id).then(TARGET => {
            return TARGET.send(embed).catch(error => {
                if (error.code == 'ECONNRESET') {
                    return console.error('[Send_DM] [' + WDR.Time(null, 'stamp') + '] [' + user_id + '] Error Code ', error.code);
                } else {
                    return console.error('[Send_DM] [' + WDR.Time(null, 'stamp') + '] [' + user_id + '] [' + WDR.Bot.Array[bot].id + '] ', error);
                }
            });
        });
    } else {
        WDR.Bot.users.fetch(user_id).then(TARGET => {
            return TARGET.send(embed).catch(error => {
                console.log(error);
                if (error.code == 'ECONNRESET') {
                    return console.error('[Send_DM] [' + WDR.Time(null, 'stamp') + '] [' + user_id + '] Error Code ', error.code);
                } else {
                    return console.error('[Send_DM] [' + WDR.Time(null, 'stamp') + '] [' + user_id + '] [' + WDR.Bot.Array[bot].id + '] ', error);
                }
            });
        });
    }
};