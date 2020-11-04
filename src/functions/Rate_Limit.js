/* eslint-disable no-async-promise-executor */
const rateLimit = {};

setInterval(function () {
    let users = Object.keys(rateLimit).map(i => rateLimit[i]);
    for (let u = 0; u < users.length; u++) {
        let user = users[u];
        if (user.count > 0) {
            user.count--;
        }
    }
}, 10000);

module.exports = (WDR, User) => {
    return new Promise(async resolve => {

        if (!rateLimit[User.user_id]) {
            rateLimit[User.user_id] = {
                user: User.user_id,
                name: User.user_name,
                paused: false,
                count: 0
            };

        } else if (rateLimit[User.user_id].count > 8) {


            let user_query = `
                UPDATE
                    wdr_users
                SET
                    status = 0,
                    pokemon_status = 0,
                    pvp_status = 0,
                    quest_status = 0,
                    raid_status = 0,
                    lure_status = 0,
                    invasion_status = 0
                WHERE
                    user_id = ${User.user_id}
            ;`;
            WDR.wdrDB.query(user_query);

            WDR.UpdateAllSubTables(WDR, `UPDATE %TABLE% SET status = 0 WHERE user_id = ${User.user_id}`);

            setTimeout(function () {
                if (rateLimit[User.user_id].paused === false) {
                    WDR.Console.error(WDR, '[Rate_Limit.js] User ' + User.user_name + ' (' + User.user_id + ') has exceeded DM rate limits. User has been paused.');
                    rateLimit[User.user_id].paused = true;
                    let embed = new WDR.DiscordJS.MessageEmbed()
                        .setColor('FF0000')
                        .setTitle('**Your Subscriptions have been PAUSED.**')
                        .setDescription('You subscriptions have exceeded DM rate limits. Please modify or remove some subscriptions before re-enabling.')
                        .setFooter('If you have any questions, contact a community leader or admin.');
                    WDR.Bot.Array[User.bot].users.fetch(User.user_id).then(TARGET => {
                        return TARGET.send(embed).catch(console.error);
                    });
                }
            }, 10000);


        } else if (rateLimit[User.user_id].count >= 0) {
            if (rateLimit[User.user_id].count > 3) {
                WDR.Console.error(WDR, '[Rate_Limit.js] User ' + User.user_name + ' (' + User.user_id + ')\'s Subscription DM rate is exceeding 20/minute.');
            }
            rateLimit[User.user_id].paused = false;
            rateLimit[User.user_id].count++;
        }

        return resolve();

    });
};