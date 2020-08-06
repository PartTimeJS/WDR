const Discord = require('discord.js');

module.exports = async (BOT, channel) => {
  let config = BOT.Configs.get(channel.guild.id);
  if (!config) {
    return;
  }
  setTimeout(function() {
    let config = BOT.Configs.get(channel.guild.id);
    if (!config) {
      return;
    }
    let index = config.channels.indexOf(channel.id);
    let channels = config.channels.split(',');
    if (index >= 0) {
      channels.splice(channel.id, 1);
    }
    if (channel.name == 'beer_lounge') {
      channel.guild.createChannel('beer_lounge', 'text')
        .then(beer_channel => {
          beer_channel.setParent('360971911225933836').then(beer_channel => {
            beer_channel.overwritePermissions(channel.guild.id, {
              'READ_MESSAGES': false
            }).then(beer_channel => {
              beer_channel.overwritePermissions('478969731983081492', {
                'READ_MESSAGES': true
              });
            });
          });
        });
    }
    channels = channels.toString();
    BOT.sql.query("UPDATE `" + channel.guild.id + "` SET channels = ? LIMIT 1", [channels], function(error, results, fields) {
      if (error) {
        return console.error('[ChannelDelete]', error);
      }
      if (config.log_server_state === 'ENABLED') {
        let channelDeleted = new Discord.MessageEmbed().setColor('ffc700')
          .setTitle('💥 #' + channel.name + ' Channel Destroyed')
          .setFooter(BOT.time(config.timezone));
        return BOT.channels.cache.get(config.log_server_channel).send(channelDeleted).catch(error => {
          console.error('[ChannelDelete]', error);
        });
      }
    });
  }, 500);
  return;
}