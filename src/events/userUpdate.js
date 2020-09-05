const Discord = require('discord.js');

module.exports = async (BOT, oldUser, newUser) => {
  BOT.guilds.cache.map(guild => {
    let member = guild.members.cache.get(newUser.id),
      uName = '';
    if (member) {
      let config = BOT.Configs.get(member.guild.id);
      if (!config) {
        return;
      }
      if (member.nickname) {
        uName = member.nickname;
      } else {
        uName = member.user.username;
      }
      if (config.log_user_state === 'ENABLED' && newUser.id != BOT.ID) {
        switch (true) {
          case oldUser.username != newUser.username:
            let usernameChange = new Discord.MessageEmbed().setColor("cc33ff")
              .setAuthor(uName + ' (' + newUser.id + ')', newUser.displayAvatarURL)
              .setTitle("✏ **Username Changed**")
              .addField("Old Username:", oldUser.tag, true)
              .addField("New Username:", newUser.tag, true)
              .setFooter(BOT.time(config.timezone));
            return BOT.channels.cache.get(config.log_user_channel).send(usernameChange).catch(error => {
              console.error('[UserUpdate]', error);
            });
          case oldUser.displayAvatarURL != newUser.displayAvatarURL:
            let avatarChange = new Discord.MessageEmbed().setColor("0050ff")
              .setAuthor(uName + ' (' + newUser.id + ')', newUser.displayAvatarURL)
              .setTitle("📷 **Avatar Changed**")
              .setImage(newUser.displayAvatarURL)
              .setFooter(BOT.time(config.timezone));
            return BOT.channels.cache.get(config.log_user_channel).send(avatarChange).catch(error => {
              console.error('[UserUpdate]', error);
            });
          default:
            return;
        }
      }
    }
  });
  return;
}