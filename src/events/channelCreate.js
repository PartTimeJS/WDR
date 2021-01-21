const Discord = require('discord.js');

module.exports = async (BOT, channel) => {
    if (!channel.guild) {
        return;
    }
    let config = BOT.Configs.get(channel.guild.id);
    if (!config) {
        return;
    }
    setTimeout(function() {
        if (!channel.guild) {
            return;
        }
        let config = BOT.Configs.get(channel.guild.id);
        if (!config) {
            return;
        }
        let index = config.channels.indexOf(channel.id);
        if (index >= 0) {
            return;
        }
        let channels = config.channels + ',' + channel.id;
        BOT.sql.query('UPDATE `' + channel.guild.id + '` SET channels = ? LIMIT 1', [channels], function(error) {
            if (error) {
                return console.error('[ChannelCreate]', error);
            }
            if (config.log_server_state === 'ENABLED') {
                let channelCreated = new Discord.MessageEmbed().setColor('96f644')
                    .setTitle('#' + channel.name + ' Channel Created')
                    .setFooter(BOT.time(config.timezone));
                return BOT.channels.cache.get(config.log_server_channel).send(channelCreated).catch(error => {
                    console.error('[ChannelCreate]', error);
                });
            }
        });
        return;
    }, 500);
};