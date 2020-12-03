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
            return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error);
        } else if (!user || !user[0]) {
            WDR.Console.error(WDR, '[COMMANDS] [' + WDR.Time(null, 'stamp') + '] [raid.js/(subscription_status)] Could not retrieve user: ' + member.nickname + ' entry from dB.');
            return message.reply('There has been an error retrieving your user data from the dB contact an Admin to fix.');
        } else {

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
                let change;
                if (reason == 'pause') {
                    change = 'PAUSED';
                }
                if (reason == 'resume') {
                    change = 'ACTIVE';
                }
                WDR.wdrDB.query(`
                        UPDATE 
                            users 
                        SET 
                            raids_status = ${change} 
                        WHERE 
                            user_id = '${message.author.id}' 
                                AND 
                            guild_id = '${message.guild.id}'
                    ;`, 
                function (error) {
                    if (error) {
                        return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error);
                    } else {
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