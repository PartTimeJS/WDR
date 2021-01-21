module.exports = (WDR, Functions, message, member, reason) => {
    WDR.wdrDB.query(`
        SELECT
            *
        FROM
            users
        WHERE
            user_id = '${member.id}'
                AND 
            guild_id = '${message.guild.id}'
    ;`,
    function (error, user) {
        if (error) {
            console.error(error); 
            console.error(error);
            return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                timeout: 10000
            }));
        } else if (!user || !user[0]) {
            WDR.Console.error(WDR, '[COMMANDS] [' + WDR.Time(null, 'stamp') + '] [raid.js/(subscription_status)] Could not retrieve user: ' + member.nickname + ' entry from dB.');
            console.error(error);
            return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                timeout: 10000
            }));
        } else {
            let change;
            if (user[0].raids_status == 'ACTIVE' && reason == 'resume') {
                let already_active = new WDR.DiscordJS.MessageEmbed().setColor('ff0000')
                    .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                    .setTitle('Your Raid subscriptions are already **Active**!')
                    .setFooter('You can type \'view\', \'add\', or \'remove\'.');

                // SEND THE EMBED
                message.channel.send(already_active).catch(console.error).then(m => m.delete({
                    timeout: 5000
                })).catch(console.error);
            } else if (user[0].raids_status == 'PAUSED' && reason == 'pause') {
                let already_paused = new WDR.DiscordJS.MessageEmbed().setColor('ff0000')
                    .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                    .setTitle('Your Raid subscriptions are already **Paused**!')
                    .setFooter('You can type \'view\', \'add\', or \'remove\'.');

                // SEND THE EMBED
                return message.channel.send(already_paused).catch(console.error).then(m => m.delete({
                    timeout: 5000
                })).catch(console.error);
            } else {
                if (reason == 'pause') {
                    change = 0;
                } else if (reason == 'resume') {
                    change = 1;
                }
                WDR.wdrDB.query(`
                    UPDATE
                        wdr_users
                    SET
                        pokemon_status = ${change}
                    WHERE
                        user_id = '${member.id}'
                            AND
                        guild_id = '${message.guild.id}'
                ;`, 
                function (error) {
                    if (error) {
                        console.error(error);
                        return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                            timeout: 10000
                        }));
                    } else {
                        switch (change) {
                            case 0:
                                change = 'DISABLED';
                                break;
                            case 1:
                                change = 'ENABLED';
                                break;
                        }
                        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                            .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                            .setTitle('Your Raid subscriptions have been set to `' + change + '`!')
                            .setFooter('Saved to the ' + WDR.config.BOT_NAME + ' Database.');
                        return message.channel.send(subscription_success).then(m => m.delete({
                            timeout: 5000
                        })).catch(console.error);
                    }
                });
            }
        }
    });
};