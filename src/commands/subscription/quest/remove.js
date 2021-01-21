module.exports = (WDR, Functions, Message, Member) => {
    WDR.wdrDB.query(`
        SELECT
            *
        FROM
            wdr_quest_subs
        WHERE
            user_id = '${Member.id}'
                AND
            guild_id = '${Message.guild.id}'
    ;`,
    async function(error, subscriptions) {

        if (error) {
            WDR.Console.error(WDR, '[cmd/sub/raid/remove.js] Error Fetching Subscriptions to Create Subscription.', [error]);
            return Message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                timeout: 10000
            }));

        } else {
            if (subscriptions.length < 1) {
                let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('You do not have any Quest Subscriptions!')
                    .setFooter('You can type \'view\', \'add\', or \'remove\'.');
                Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
                    return Functions.OptionCollect(WDR, Functions, 'remove', Message, BotMsg, Member);
                });

            } else {
                let sub_list = '';
                for (let s = 0, slen = subscriptions.length; s < slen; s++) {
                    let choice = s + 1;
                    let sub_data = subscriptions[s];
                    sub_list += '**' + choice + ' - ' + sub_data.reward + '**\n';
                    if(sub_data.geotype !== 'city'){
                        if(sub_data.geotype === 'location'){
                            sub_list += '　' +  'Area: ' + '`' + JSON.parse(sub_data.location).name + '`';
                        } else {
                            sub_list += '　' +  'Area: ' + '`' + sub_data.areas + '`' + '\n';
                        }
                    } else {
                        sub_list += '　' +  'Area: ' + '`All`'+ '\n';
                    }
                    sub_list += '\n';
                }
                sub_list = sub_list.slice(0, -1);

                let remove_id = await Functions.DetailCollect(WDR, Functions, 'Remove', Member, Message, sub_list, 'Type the Number of the Subscription you want to remove.', null);

                let remove = subscriptions[remove_id];

                let query = `
                    DELETE FROM
                        wdr_quest_subs
                    WHERE
                        user_id = '${Member.id}'
                            AND
                        reward = '${remove.reward}'
                ;`;
            
                WDR.wdrDB.query(
                    query,
                    function(error) {
                        if (error) {
                            WDR.Console.error(WDR, '[src/cmd/quest/remove.js] Error Removing Subscription.', [query, error]);
                            console.error(error);
                            return Message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                                timeout: 10000
                            }));
                        } else {
                            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                                .setTitle('Quest Subscription Removed.')
                                .setDescription('Saved to the Database.')
                                .setFooter('You can type \'view\', \'presets\', \'add\', or \'remove\'.');
                            return Message.channel.send(subscription_success).then(BotMsg => {
                                return Functions.OptionCollect(WDR, Functions, 'complete', Message, BotMsg, Member);
                            });
                        }
                    }
                );
            }
        }
    }
    );
};
