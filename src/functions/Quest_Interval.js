module.exports = (WDR, name) => {
    setInterval(() => {
        MAIN.pdb.query(`
            SELECT 
            * 
            FROM 
            wdr_quest_queue 
            WHERE 
            alert_time < UNIX_TIMESTAMP()*1000;`,
            function(error, alerts, fields) {
                if (alerts && alerts[0]) {
                alerts.forEach(async (alert, index) => {
                    setTimeout(async function() {
                    let guild = MAIN.BOTS[alert.bot].guilds.cache.get(alert.discord_id);
                    let user = guild.members.fetch(alert.user_id).catch(error => {
                        console.error('[BAD USER ID] ' + alert.user_id, error);
                    });
                    MAIN.BOTS[alert.bot].guilds.cache.get(alert.discord_id).members.fetch(alert.user_id).then(TARGET => {
                        let quest_embed = JSON.parse(alert.embed);
                        TARGET.send({
                        embed: quest_embed
                        }).catch(error => {
                        return console.error('[' + MAIN.Bot_Time(null, 'stamp') + '] ' + TARGET.user.tag + ' (' + alert.user_id + ') , CANNOT SEND THIS USER A MESSAGE.', error);
                        });
                    });
                    }, 2000 * index);
                });
                if (MAIN.debug.Quests == 'ENABLED' && MAIN.debug.Subscriptions == 'ENABLED') {
                    console.log(MAIN.Color.pink + '[SUBSCRIPTIONS] [' + MAIN.Bot_Time(null, 'stamp') + '] [bot.js] [QUESTS] Sent ' + alerts.length + ' Quest Alerts out.' + MAIN.Color.reset);
                }
                MAIN.pdb.query(`DELETE FROM quest_alerts WHERE alert_time < UNIX_TIMESTAMP()*1000`, function(error, alerts, fields) {
                    if (error) {
                    console.error;
                    }
                });
                }
            }
        );
    }, 60000);
}