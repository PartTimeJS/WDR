const Discord = require('discord.js');



module.exports = async (BOT, oldChannel, newChannel) => {
    let config = BOT.Configs.get(oldChannel.guild.id);
    if (!config) {
        return;
    }
    setTimeout(function() {
        if (oldChannel.name == 'beer_lounge' && newChannel.name != 'beer_lounge') {
            newChannel.edit({
                name: 'beer_lounge'
            }).catch(console.error);
        }
        if (oldChannel.name == 'beer_lounge' || newChannel.name == 'beer_lounge') {
            newChannel.overwritePermissions('478969731983081492', {
                'READ_MESSAGES': true,
                'SEND_MESSAGES': true,
                'READ_MESSAGE_HISTORY': true
            });
            newChannel.overwritePermissions(newChannel.guild.id, {
                'READ_MESSAGES': false
            });
        }
        let config = BOT.Configs.get(newChannel.guild.id);
        if (!config) {
            return;
        }
        if (config.log_server_state == 'ENABLED') {
            let oldPerms = oldChannel.permissionOverwrites.map(perms => perms),
                newPerms = newChannel.permissionOverwrites.map(perms => perms);
            switch (true) {
                case oldChannel.parent != newChannel.parent:
                    return;
                case oldChannel.name != newChannel.name:
                    oldChannel.guild.fetchAuditLogs({
                        limit: 1,
                        type: 11
                    }).then(auditLog => {
                        auditLog.entries.map(log => {
                            let nameChange = new Discord.MessageEmbed().setColor('ff6699')
                                .setTitle('**Channel Name Changed**')
                                .addField('Old Name:', '#' + oldChannel.name, true)
                                .addField('New Name:', '#' + newChannel.name, true)
                                .setFooter('By ' + log.executor.tag + ' on ' + BOT.time(config.timezone));
                            return BOT.channels.cache.get(config.log_server_channel).send(nameChange).catch(error => {
                                console.error('[ChannelUpdate]', error);
                            });
                        });
                    });
                    break;
                case oldPerms.length !== newPerms.length:
                    if (newPerms.length > oldPerms.length) {
                        oldChannel.guild.fetchAuditLogs({
                            limit: 1,
                            type: 13
                        }).then(auditLog => {
                            auditLog.entries.map(log => {
                                let addedPerm = new Discord.MessageEmbed().setColor('ff6699')
                                    .setTitle('**' + log.extra.name + ' Permissions Added To #' + newChannel.name + '**')
                                    .setFooter('By ' + log.executor.tag + ' on ' + BOT.time(config.timezone));
                                return BOT.channels.cache.get(config.log_server_channel).send(addedPerm).catch(error => {
                                    console.error('[ChannelUpdate]', error);
                                });
                            });
                        });
                    }
                    if (oldPerms.length > newPerms.length) {
                        oldChannel.guild.fetchAuditLogs({
                            limit: 1,
                            type: 15
                        }).then(auditLog => {
                            auditLog.entries.map(log => {
                                let removedPerm = new Discord.MessageEmbed().setColor('ff6699')
                                    .setTitle('**' + log.extra.name + ' Permissions Removed From #' + newChannel.name + '**')
                                    .setFooter('By ' + log.executor.tag + ' on ' + BOT.time(config.timezone));
                                return BOT.channels.cache.get(config.log_server_channel).send(removedPerm).catch(error => {
                                    console.error('[ChannelUpdate]', error);
                                });
                            });
                        });
                    }
                    break;
                default:
                    oldChannel.guild.fetchAuditLogs({
                        limit: 1,
                        type: 14
                    }).then(auditLog => {
                        auditLog.entries.map(log => {
                            for (let x = 0; x < newPerms.length; x++) {
                                if (newPerms[x] && oldPerms[x]) {
                                    if (newPerms[x].deny != oldPerms[x].deny) {
                                        //let role = newChannel.guild.donorRoles.cache.find(ch => ch.id === newPerms[x].id);
                                        let permChange = new Discord.MessageEmbed().setColor('ff7a00')
                                            .setTitle('**' + log.extra.name + ' Permissions Changed For #' + newChannel.name + '**')
                                            .setFooter('By ' + log.executor.tag + ' on ' + BOT.time(config.timezone));
                                        return BOT.channels.cache.get(config.log_server_channel).send(permChange).catch(error => {
                                            console.error('[ChannelUpdate]', error);
                                        });
                                    }
                                }
                            }
                        });
                    });
            }
        } else {
            return;
        }
    }, 500);
    return;
};