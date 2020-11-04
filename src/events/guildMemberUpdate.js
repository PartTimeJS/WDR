const Discord = require('discord.js');

module.exports = async (BOT, oldMember, newMember) => {
    let config = BOT.Configs.get(newMember.guild.id);
    if (!config) {
        return;
    }
    var MessageEmbed = '',
        uName = '',
        executor = '',
        logTitle = '',
        newNickname = '',
        args = undefined;
    if (oldMember.nickname) {
        uName = oldMember.nickname;
    } else {
        uName = oldMember.user.username;
    }
    if (config.log_user_state === 'ENABLED' && newMember.id !== BOT.ID) {
        let oldRoles = oldMember.roles.cache.array().toString(),
            newRoles = newMember.roles.cache.array().toString();
        switch (true) {
            case oldMember.nickname !== newMember.nickname:
                oldMember.guild.fetchAuditLogs({
                    limit: 1,
                    type: 24
                }).then(auditLog => {
                    auditLog.entries.map(log => {
                        switch (true) {
                            case log.target.id !== newMember.id:
                                break;
                            default:
                                executor = log.executor.tag;
                                if (newMember.nickname === null) {
                                    newNickname = newMember.user.username;
                                } else {
                                    newNickname = newMember.nickname;
                                }
                                MessageEmbed = new Discord.MessageEmbed().setColor('ffff00')
                                    .setAuthor(uName + ' (' + newMember.id + ')', newMember.user.displayAvatarURL)
                                    .setTitle('Nickname Changed to "' + newNickname + '"')
                                    .setFooter('By ' + executor + ' on ' + BOT.time(config.timezone));
                                return BOT.channels.cache.get(config.log_user_channel).send(MessageEmbed).catch(error => {
                                    console.error('[GuildMemberUpdate]', error);
                                });
                        }
                    });
                });
                break;
            case oldRoles !== newRoles:
                oldMember.guild.fetchAuditLogs({
                    limit: 1,
                    type: 25
                }).then(auditLog => {
                    auditLog.entries.map(log => {
                        let roleState = log.changes[0].key.slice(1),
                            roleName = '',
                            embedColor = '',
                            changedRole = oldMember.guild.roles.cache.find(role => role.name === log.changes[0].new[0].name);
                        if (changedRole) {
                            embedColor = changedRole.color;
                            roleName = changedRole.name;
                        } else {
                            embedColor = '00c2ff';
                            roleName = log.changes[0].new[0].name;
                        }
                        if (log.reason !== null) {
                            args = log.reason.split(',');
                        }
                        switch (true) {
                            case log.target.id !== newMember.id:
                                return;
                            default:
                                switch (true) {
                                    case log.changes[0].new[0].name === 'Muted':
                                        if (args[0] == 'EXPIRED') {
                                            return muteRole(BOT, config, log, newMember);
                                        }
                                        break;
                                    case args == undefined && roleState == 'add':
                                        executor = log.executor.tag;
                                        logTitle = 'Role Assigned';
                                        break;
                                    case args == undefined && roleState == 'remove':
                                        executor = log.executor.tag;
                                        logTitle = 'Role Removed';
                                        break;
                                    case args[0] == 'RAR' && roleState == 'add':
                                        executor = args[1];
                                        logTitle = 'Role Assigned via Reaction';
                                        break;
                                    case args[0] == 'RAR' && roleState == 'remove':
                                        executor = args[1];
                                        logTitle = 'Role Removed via Reaction';
                                        break;
                                    case args[0] == 'TRAR' && roleState == 'add':
                                        executor = args[1];
                                        logTitle = 'Temp Role Assigned via Reaction';
                                        break;
                                    case args[0] == 'TRAR' && roleState == 'remove':
                                        executor = args[1];
                                        logTitle = 'Temp Role Removed via Reaction';
                                        break;
                                    case args[0] == 'EXPIRED' && roleState == 'remove':
                                        executor = log.executor.tag;
                                        logTitle = 'Temp Role Expired';
                                        break;
                                    case args[0] == 'RAC' && roleState == 'add':
                                        executor = args[1];
                                        logTitle = 'Role Assigned via Command';
                                        break;
                                    case args[0] == 'RAC' && roleState == 'remove':
                                        executor = args[1];
                                        logTitle = 'Role Removed via Command';
                                        break;
                                    case args[0] == 'TRA' && roleState == 'add':
                                        executor = args[1];
                                        logTitle = 'Temp Role Assigned';
                                        break;
                                    case args[0] == 'TRA' && roleState == 'remove':
                                        executor = args[1];
                                        logTitle = 'Temp Role Removed';
                                        break;
                                    case args[0] == 'TRAC' && roleState == 'add':
                                        executor = args[1];
                                        logTitle = 'Temp Role Assigned via Command';
                                        break;
                                    case args[0] == 'TRAC' && roleState == 'remove':
                                        executor = args[1];
                                        logTitle = 'Temp Role Removed via Command';
                                        break;
                                    default:
                                        return;
                                }
                                MessageEmbed = new Discord.MessageEmbed().setColor(embedColor)
                                    .setTitle(roleName + ' ' + logTitle)
                                    .setAuthor(uName + ' (' + newMember.id + ')', newMember.user.displayAvatarURL)
                                    .setFooter('By ' + executor + ' on ' + BOT.time(config.timezone));
                                return BOT.channels.cache.get(config.log_user_channel).send(MessageEmbed).catch(error => {
                                    console.error('[GuildMemberUpdate]', error);
                                });
                        }
                    });
                });
                break;
            default:
                return;
        }
    }
    return;
};

function muteRole(BOT, config, log, member) {
    let roleState = log.changes[0].key.slice(1),
        reason = '',
        duration = '',
        executor = '',
        args = '',
        MessageEmbed = '',
        uName = '';
    if (member.nickname) {
        uName = member.nickname;
    } else {
        uName = member.user.username;
    }
    if (!log.reason) {
        reason = 'None Specified';
        duration = 'TBD';
        executor = log.executor.tag;
    } else {
        args = log.reason.split(';');
        reason = args[1];
        duration = args[2];
        executor = args[0];
    }
    switch (roleState) {
        case 'add':
            MessageEmbed = new Discord.MessageEmbed().setColor('000000')
                .setAuthor(uName + ' (' + member.id + ')', member.user.displayAvatarURL)
                .setTitle('🔇 ' + uName + ' has been Muted')
                .addField('Reason:', reason, true)
                .addField('Duration:', duration, true)
                .setFooter('By ' + executor + ' on ' + BOT.time(config.timezone));
            return BOT.channels.cache.get(config.log_user_channel).send(MessageEmbed).catch(error => {
                console.error('[GuildMemberUpdate]', error);
            });
        case 'remove':
            MessageEmbed = new Discord.MessageEmbed().setColor('000000')
                .setAuthor(uName + ' (' + member.id + ')', member.user.displayAvatarURL)
                .setTitle('🔊 ' + uName + ' has been Un-Muted')
                .addField('Reason:', reason, true)
                .setFooter('By ' + executor + ' on ' + BOT.time(config.timezone));
            return BOT.channels.cache.get(config.log_user_channel).send(MessageEmbed).catch(error => {
                console.error('[GuildMemberUpdate]', error);
            });
        default:
            return;
    }
}