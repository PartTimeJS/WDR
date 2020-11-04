const Discord = require('discord.js');

module.exports = async (BOT, member) => {
    let config = BOT.Configs.get(member.guild.id);
    if (!config) {
        return;
    }
    setTimeout(function() {
        let userID, config = BOT.Configs.get(member.guild.id),
            executor, uName, reason = '';

        if (!config) {
            return;
        }

        if (config.member_count_channel) {
            let channel = BOT.channels.cache.get(config.member_count_channel);
            channel.setName('Members: ' + member.guild.memberCount);
        }

        if (member.nickname) {
            uName = member.nickname;
        } else {
            uName = member.user.username;
        }

        if (config.log_server_state === 'ENABLED') {
            member.guild.fetchAuditLogs({
                limit: 1,
                type: 22
            }).then(auditLog => {
                userID = auditLog.entries.map(u => u.target.id);
                if (userID == member.id) {
                    auditLog.entries.map(log => {
                        if (log.reason) {
                            if (log.reason.indexOf(';') >= 0) {
                                let args = log.reason.split(';');
                                executor = args[0];
                                reason = args[1];
                            } else {
                                reason = log.reason;
                            }
                        } else {
                            reason = 'No Reason Given';
                            executor = log.executor.tag;
                        }
                        let ban_embed = new Discord.MessageEmbed().setColor('ff0000')
                            .setAuthor(uName + ' (' + member.id + ')', member.user.displayAvatarURL)
                            .addField('Member Banned', reason, false)
                            .setFooter('By ' + executor + ' on ' + BOT.time(config.timezone));
                        return BOT.channels.cache.get(config.log_server_channel).send(ban_embed).catch(error => {
                            console.error('[GuildMemberRemove]', error);
                        });
                    });
                } else {
                    member.guild.fetchAuditLogs({
                        limit: 1,
                        type: 20
                    }).then(auditLog => {
                        userID = auditLog.entries.map(u => u.target.id);
                        executor = auditLog.entries.map(u => u.executor);
                        if (userID == member.id && executor && auditLog.entries.map(u => u.executor.id) != member.id) {
                            auditLog.entries.map(log => {
                                if (log.reason) {
                                    if (log.reason.indexOf(';') >= 0) {
                                        let args = log.reason.split(';');
                                        executor = args[0];
                                        reason = args[1];
                                    } else {
                                        reason = log.reason;
                                    }
                                } else {
                                    reason = 'No Reason Given';
                                    executor = log.executor.tag;
                                }
                                let kick_embed = new Discord.MessageEmbed().setColor('ffb200')
                                    .setAuthor(uName + ' (' + member.id + ')', member.user.displayAvatarURL)
                                    .addField('Member Kicked', reason, false)
                                    .setFooter('By ' + executor + ' on ' + BOT.time(config.timezone));
                                return BOT.channels.cache.get(config.log_server_channel).send(kick_embed).catch(error => {
                                    console.error('[GuildMemberRemove]', error);
                                });
                            });
                        } else {
                            let left_embed = new Discord.MessageEmbed().setColor('ffe500')
                                .setAuthor(uName + ' (' + member.id + ')', member.user.displayAvatarURL)
                                .setTitle('Member Left')
                                .setFooter(BOT.time(config.timezone));
                            return BOT.channels.cache.get(config.log_server_channel).send(left_embed).catch(error => {
                                console.error('[GuildMemberRemove]', error);
                            });
                        }
                    }).catch(error => {
                        console.error('[GuildMemberRemove]', error);
                    });
                }
            }).catch(error => {
                console.error('[GuildMemberRemove]', error);
            });
        }
    }, 1000);
    return;
};