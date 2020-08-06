const Discord = require('discord.js');

module.exports = async (BOT, member) => {
  let config = BOT.Configs.get(member.guild.id);
  if (!config) {
    return;
  }
  let MessageEmbed = '',
    timeNow = new Date().getTime();
  if (!config) {
    return;
  }

  // ASSIGN ANY ACTIVE TEMPORARY ROLES THEY HAVE
  BOT.sql.query(`SELECT * FROM temporary_roles WHERE user_id='${member.id}'`),
    function(error, rows, fields) {
      if (error) {
        return console.error('[GuildMemberAdd]', error);
      }
      if (rows) {
        reason = 'TRA,' + BOT.user.tag;
        for (let x = 0; x < rows.length; x++) {
          let role = member.guild.roles.cache.find(role => role.name === rows[x].temporary_role);
          member.roles.add(role, reason).catch(error => {
            console.error('[GuildMemberAdd]', error);
          });
        }
      }
    };

  // ASSIGN THE DEFAULT ROLE
  if (config.default_role) {
    let role = member.guild.roles.cache.find(role => role.name === config.default_role);
    member.roles.add(role).catch(error => {
      console.error('[GuildMemberAdd]', error);
    });
  }


  if (config.member_count_channel) {
    let channel = BOT.channels.cache.get(config.member_count_channel);
    channel.setName('Members: ' + member.guild.memberCount);
  }

  // POST A WELCOME MESSAGE
  if (config.welcome_message && config.welcome_channel) {
    console.log('SAW WELCOME CONFIG');
    let welcomeMsg = config.welcome_message.replace(/%USER%/g, member);
    return BOT.channels.cache.get(config.welcome_channel).send(welcomeMsg).catch(error => {
      console.error('[GuildMemberAdd]', error);
    });
  }

  // LOG THE USER JOIN
  if (config.log_server_state === 'ENABLED') {
    MessageEmbed = new Discord.MessageEmbed().setColor('00ff00')
      .setAuthor(member.user.username + ' (' + member.id + ')', member.user.displayAvatarURL)
      .addField('Member Joined', '<@' + member.id + '>', true)
      .setFooter(BOT.time(config.timezone));
    return BOT.channels.cache.get(config.log_server_channel).send(MessageEmbed).catch(error => {
      console.error('[GuildMemberAdd]', error);
    });
  }

  return;
}