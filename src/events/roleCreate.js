const Discord = require('discord.js');

module.exports = async (BOT, role) => {
  let config = BOT.Configs.get(role.guild.id);
  if (!config) {
    return;
  }
  role.guild.fetchAuditLogs({
    limit: 1,
    type: 24
  }).then(auditLog => {
    auditLog.entries.map(log => {
      MessageEmbed = new Discord.MessageEmbed().setColor('cc66ff')
        .setTitle('🛠 **' + role.name + ' Role Created**')
        .setFooter(BOT.time(config.timezone));
      return BOT.channels.cache.get(config.log_server_channel).send(MessageEmbed).catch(error => {
        console.error('[RoleCreate]', error);
      });
    });
  });
  return;
}