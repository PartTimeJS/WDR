module.exports = (WDR, Functions, message, member, reason) => {
    WDR.wdrDB.query(`
        SELECT
            *
        FROM
            wdr_users
        WHERE
            user_id = '${member.id}'
                AND 
            guild_id = '${message.guild.id}'
    ;`,
    function(error, user) {
        let change;
        if (error) {
            console.error(error);
            return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                timeout: 10000
            }));

        } else if (!user || !user[0]) {
            WDR.Console.error(WDR, '[COMMANDS] [' + WDR.Time(null, 'stamp') + '] [quest.js/(subscription_status)] Could not retrieve user: ' + member.nickname + ' entry from dB.');
            return message.reply('There has been an error retrieving your user data from the dB contact an Admin to fix.');

        } else if (user[0].quests_status === 1 && reason == 'resume') {
            let already_active = new WDR.DiscordJS.MessageEmbed().setColor('ff0000')
                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                .setTitle('Your Quest subscriptions are already **Active**!')
                .setFooter('You can type \'view\', \'add\', or \'remove\'.');
            message.channel.send(already_active).catch(console.error).then(msg => {
                return Functions.OpionCollect(WDR, Functions, 'view', message, msg, member);
            });

        } else if (user[0].quests_status === 0 && reason == 'pause') {
            let already_paused = new WDR.DiscordJS.MessageEmbed().setColor('ff0000')
                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                .setTitle('Your Quest subscriptions are already **Paused**!')
                .setFooter('You can type \'view\', \'add\', or \'remove\'.');
            message.channel.send(already_paused).catch(console.error).then(msg => {
                return Functions.OpionCollect(WDR, Functions, 'view', message, msg, member);
            });

        } else {
            if (reason == 'pause') {
                change = 0;
                reason = 'PAUSED';
            }
            if (reason == 'resume') {
                change = 1;
                reason = 'ENABLED';
            }

            WDR.wdrDB.query(`
                UPDATE
                    wdr_quest_subs
                SET
                    status = ${change}
                WHERE
                    user_id = '${member.id}'
                        AND
                    guild_id = '${message.guild.id}';
            `,
            function(error) {
                if (error) {
                    return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                        timeout: 10000
                    }));
                } else {
                    WDR.wdrDB.query(`
                        UPDATE
                            wdr_users
                        SET
                            quest_status = ${change}
                        WHERE
                            user_id = '${member.id}'
                                AND
                            guild_id = '${message.guild.id}';
                    `,
                    function(error) {
                        if (error) {
                            return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                                timeout: 10000
                            }));
                        } else {
                            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                                .setTitle('Your Quest subscriptions have been set to `' + reason + '`!')
                                .setFooter('Saved to the Database.');
                            return message.channel.send(subscription_success).then(m => m.delete({
                                timeout: 5000
                            })).catch(console.error);
                        }
                    });
                }
            });
        }
    });
};
