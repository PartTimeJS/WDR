

module.exports.run = async (MAIN, BOT, message) => {

  // DEFINE VARIABLES
  let prefix = MAIN.config.PREFIX, command = '';
  let command_fix = message.content.split(' ')[0].toString().toLowerCase();
  let command_prefix = command_fix.split(prefix);
  if(command_prefix[1]){ command_prefix = command_prefix[1].toString().toLowerCase()}

  // CHECK IF THE MESSAGE IS FROM A BOT
  if(message.author.bot == true){ return; }

  if(message.channel.type == 'dm'){

    MAIN.Discords.Servers.forEach( async (server,index) => {

      // GET GUILD
      let guild = MAIN.guilds.get(server.id);
      if(!guild){ return; }

      // GET MEMBER
      let member = MAIN.guilds.get(server.id).members.get(message.author.id);
      if(!member){ return; }

      let isAdmin = member.hasPermission('ADMINISTRATOR') ? true : false;

      // FETCH THE GUILD MEMBER AND CHECK IF A DONOR
      if(isAdmin){ /* DO NOTHING */ }
      else if(server.donor_role && !member.roles.has(server.donor_role)){
        let donor_info = '';
        if(MAIN.config.log_channel){
          let nondonor_embed = new MAIN.Discord.RichEmbed()
          .setColor('ff0000')
          .addField('User attempted to use DM command, not a donor. ',member.user.username);
          if(MAIN.config.donor_info){ donor_info = MAIN.config.donor_info}
          MAIN.Send_Embed(MAIN, 'member', 0, server.id, '', nondonor_embed, MAIN.config.log_channel);
        } else { console.log(MAIN.Color.red+'User attempted to use DM command, not a donor. '+member.user.username+MAIN.Color.reset); }
        return message.reply('This feature is only for donors. '+donor_info);
      }

      MAIN.pdb.query("SELECT * FROM users WHERE user_id = ?", [message.author.id, server.id], async function (error, user, fields) {
        // CHECK IF THE USER HAS AN EXISTING RECORD IN THE USER TABLE
        if(!user || !user[0]){
          return message.reply('Before you can create and modify subscriptions via DM, you must first use the subsciption channel in your scanner discord.');
        } else if(user[0].discord_id != server.id){
          // DON'T KEEP CYCLING THROUGH SERVERS. I'M LAZY
          // THIS IS WHERE WE COULD ASK "WHAT SERVER DO YOU WANT TO MODIFY SUBS FOR?"
          return;
        } else{

          // FIND THE COMMAND(s) AND SEND TO THE MODULE
          command = Get_Commands(MAIN, member, command_prefix, isAdmin);

          // SEND TO THE COMMAND FUNCTION
          let cmd = MAIN.Commands.get(command);
          if(cmd){ return cmd.run(MAIN, message, prefix, server); }
          // IF YOU WANT USERS TO BE ABLE TO DM ALL BOTS, UNCOMMENT THIS AND COMMENT THE LINE ABOVE
          //if(cmd){ return cmd.run(BOT, message, prefix, server); }
        }
      });
    });
  } else if(BOT == MAIN){

    // DISCORD SERVER FOR THE SUB CHANNEL
    let server = MAIN.Discords.Servers.find(server => server.id == message.guild.id);
    if(!server){ return; }

    // IGNORED CHANNELS
    if(server.ignored_channels.indexOf(message.channel.id) >= 0) { return; }

    // GET GUILD
    let guild = MAIN.guilds.get(server.id);
    if(!guild){ return; }

    // GET MEMBER
    let member = MAIN.guilds.get(server.id).members.get(message.author.id);
    if(!member){ return; }

    let isAdmin = member.hasPermission('ADMINISTRATOR') ? true : false;

    // CHECK FOR SERVER COMMAND CHANNEL, ONLY RESPOND TO COMMANDS IN THAT CHANNEL
    if(server.command_channels.indexOf(message.channel.id) >= 0){

      // DELETE THE MESSAGE
      if(MAIN.config.Tidy_Channel == 'ENABLED'){ message.delete(); }

      // FETCH THE GUILD MEMBER AND CHECK IF A DONOR
      if(isAdmin){ /* DO NOTHING */ }
      else if(server.donor_role && !member.roles.has(server.donor_role)){
        if(MAIN.config.log_channel){
          let donor_info = '';
          let nondonor_embed = new MAIN.Discord.RichEmbed()
          .setColor('ff0000')
          .addField('User attempted to use a subsciption command, not a donor. ',member.user.username);
          if(MAIN.config.donor_info){ donor_info = MAIN.config.donor_info}
          guild.fetchMember(message.author.id).then( TARGET => {
            TARGET.send('This feature is only for donors. '+donor_info).catch(console.error);
          });
          return MAIN.Send_Embed(MAIN, 'member', 0, server.id, '', nondonor_embed, MAIN.config.log_channel);
        } else { return console.log(MAIN.Color.red+'User attempted to use DM command, not a donor. '+member.user.username+MAIN.Color.reset); }
      }

      // LOAD DATABASE RECORD BASED OFF OF ORIGIN SERVER_ID AND AUTHOR_ID
      MAIN.pdb.query('SELECT * FROM users WHERE user_id = ? AND discord_id = ?', [message.author.id, message.guild.id], async function (error, user, fields) {

        // CHECK IF THE USER HAS AN EXISTING RECORD IN THE USER TABLE
        if(!user || !user[0]){ await MAIN.Save_User(MAIN, message, server); }

        // FIND THE COMMAND(s) AND SEND TO THE MODULE
        command = Get_Commands(MAIN, member, command_prefix, isAdmin);

        // SEND TO THE COMMAND FUNCTION
        let cmd = MAIN.Commands.get(command);
        if(cmd){ return cmd.run(MAIN, message, prefix, server); }
      });
    }

    // GLOBAL COMMANDS
    if (server.command_channels.indexOf(message.channel.id) < 0){

      command = Get_Spam_Commands(MAIN, member, command_prefix, isAdmin);
      Get_Wrong_Channel(MAIN, member, command_fix, server);

      if(command_fix == prefix+'filter' && isAdmin) { command = 'filter'; }
      // SEND TO THE COMMAND FUNCTION
      let cmd = MAIN.Commands.get(command);
      if(cmd){ return cmd.run(MAIN, message, prefix, server); }
    }

    // CHECK FOR ACTIVE RAID CHANNELS FOR RAID COMMANDS
    if (MAIN.config.Raid_Lobbies == 'ENABLED') {
      MAIN.pdb.query(`SELECT * FROM active_raids WHERE active = ?`, [true], function (error, raids, fields) {
        if(error){ console.error(error);}
        if(!raids){ return; }

        // FIND RAID CHANNEL BASED ON ACTIVE RAIDS
        let raid_channel = raids.find(channels => channels.raid_channel == message.channel.id);
        if(!raid_channel){ return; }

        // GET RAID LOBBY COMMAND
        command = Get_Raid_Commands(MAIN, member, message.content.toLowerCase());

        // SEND TO THE COMMAND FUNCTION
        let cmd = MAIN.Commands.get(command);
        if(cmd){ return cmd.run(MAIN, message, raid_channel); }
        else{ return; }
      });
    }

    return;
  }
}

function notAdmin(){
  message.reply('You do not have the ability to do this command, contact an admin.').then(m => m.delete(5000)).catch(console.error);
}

function Get_Raid_Commands(MAIN, member, input){
  switch (input) {
    // USER HAS ARRIVED AT THE RAID
    case 'i\’m here':
    case 'i\'m here':
    case 'here': return 'here';
    // USER IS INTERESTED
    case 'interested': return 'interested';
    // USER HAS INDICATED THEY'RE ON THE WAY
    case 'coming':
    case 'on the way':
    case 'on my way!':
    case 'omw': return 'coming';
    // USER IS NO LONGER INTERESTED AND LEFT THE RAID
    case 'leave':
    case 'not coming':
    case 'not interested': return 'leave';
    default: return;
  }
}

function Get_Commands(MAIN, member, input, isAdmin){
  switch(input){
    case 'reload': if(isAdmin){ return MAIN.Initialize('reload'); } else {  return notAdmin(); }
    case 'purge': if(isAdmin){ return MAIN.Purge_Channels(); } else { return notAdmin(); }
    case 'restart': if(isAdmin){ return MAIN.restart('due to admin restart command.', 0); } else { return notAdmin(); }
    case 'pull': if(isAdmin){ return 'pull' } else { return notAdmin(); }
    case 'pause': return 'pause';
    case 'resume': return 'resume';
    case 'help': return 'help';
    case 'p':
    case 'pokemon': return 'pokemon';
    case 'pvp': return 'pvp';
    case 'r':
    case 'raid': return 'raid';
    case 'lobby': return 'lobby';
    case 'q':
    case 'quest': return 'quest';
    case 'l':
    case 'lure': return 'lure';
    case 'i':
    case 'invasion': return 'invasion';
    case 'a':
    case 'area': return 'area';
    default: return Get_Spam_Commands(MAIN, member, input, isAdmin);
  }
}

function Get_Spam_Commands(MAIN, member, input, isAdmin){
  switch (input) {
    case 'r':
    case 'raid': return 'lobby';
    case 'n':
    case 'nest': return 'nest';
    case 's':
    case 'seen':
    case 'pokemonstats':
    case 'pokemon stats': return 'seen';
    case 'communityday': return 'communityday';
    case 'dex': return 'dex';
    case 'cp': return 'cp';
    case 'raidcp':
    case 'catchcp': return 'raidcp';
    case 'weathercp':
    case 'boostedcp': return 'weathercp';
    case 'questcp': return 'questcp';
    case 'rank': return 'rank';
    case 'events': return 'events';
    case 'help': return 'help';
    default: return;
  }
}

function Get_Wrong_Channel(MAIN, member, input, server){
  switch (input) {
    case MAIN.config.PREFIX+'pokemon':
    case MAIN.config.PREFIX+'pvp':
    case MAIN.config.PREFIX+'quest':
    case MAIN.config.PREFIX+'invasion':
    case MAIN.config.PREFIX+'area':
    case MAIN.config.PREFIX+'pause':
    case MAIN.config.PREFIX+'resume':
      if(MAIN.config.Tidy_Channel == 'ENABLED'){ message.delete(); }
      let command_channels = server.command_channels.map(channel => '<#'+channel+'>' ).join(' ');
      return message.reply('Use of this subsciption command will only work in: '+command_channels).then(m => m.delete(8000)).catch(console.error);
    default: return;
  }
}
