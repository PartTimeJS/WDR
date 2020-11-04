module.exports = (WDR, Functions, Message, Member, gym_name_array, gym_detail_array, gym_collection) => {
    WDR.wdrDB.query(
        `SELECT
        *
     FROM
        users
     WHERE
        user_id = '${Member.id}'
          AND 
        guild_id = '${Message.guild.id}`,
        function (error, user) {
            if (error) {
                return Message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error);
            } else if (!user || !user[0]) {
                WDR.Console.error(WDR, '[COMMANDS] [' + WDR.Time(null, 'stamp') + '] [raid.js/(subscription_status)] Could not retrieve user: ' + Member.nickname + ' entry from dB.');
                return Message.reply('There has been an error retrieving your user data from the dB contact an Admin to fix.');
            } else {

                if (user[0].raids_status == 'ACTIVE' && reason == 'resume') {
                    let already_active = new WDR.DiscordJS.MessageEmbed().setColor('ff0000')
                        .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                        .setTitle('Your Raid subscriptions are already **Active**!')
                        .setFooter('You can type \'view\', \'add\', or \'remove\'.');

                    // SEND THE EMBED
                    message.channel.send(already_active).catch(console.error).then(msg => {
                        return Functions.initiate_collector(WDR, 'view', message, msg, member, prefix, gym_detail_array, discord, gym_collection);
                    });
                } else if (user[0].raids_status == 'PAUSED' && reason == 'pause') {
                    let already_paused = new WDR.DiscordJS.MessageEmbed().setColor('ff0000')
                        .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                        .setTitle('Your Raid subscriptions are already **Paused**!')
                        .setFooter('You can type \'view\', \'add\', or \'remove\'.');

                    // SEND THE EMBED
                    message.channel.send(already_paused).catch(console.error).then(msg => {
                        return initiate_collector(WDR, 'view', message, msg, member, prefix, gym_detail_array, discord, gym_collection);
                    });
                } else {
                    if (reason == 'pause') {
                        change = 'PAUSED';
                    }
                    if (reason == 'resume') {
                        change = 'ACTIVE';
                    }
                    WDR.wdrDB.query('UPDATE users SET raids_status = ? WHERE user_id = ? AND guild_id = ?', [change, message.author.id, Message.guild.id], function (error, user) {
                        if (error) {
                            return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error);
                        } else {
                            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                                .setTitle('Your Raid subscriptions have been set to `' + change + '`!')
                                .setFooter('Saved to the ' + WDR.config.BOT_NAME + ' Database.');
                            return message.channel.send(subscription_success).then(m => m.delete({
                                timeout: 5000
                            })).catch(console.error);
                        }
                    });
                }
            }
        }
    );
};