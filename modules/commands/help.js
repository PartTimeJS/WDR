const Discord=require('discord.js');

module.exports.run = async (MAIN, message, prefix, discord) => {
  let help = new MAIN.Discord.RichEmbed();

  // COMMAND CHANNEL HELP
  if((discord.command_channels.indexOf(message.channel.id) >= 0 && discord.spam_channels.indexOf(message.channel.id) < 0) || message.channel.type == 'dm'){
    help.setColor('000044')
    help.setAuthor('Available Subscription Commands:')
    help.setDescription('Type a Command to view category options.');
    if(MAIN.config.POKEMON.Subscriptions == 'ENABLED'){
      help.addField('`'+prefix+'pokemon`  |  `'+prefix+'p`', 'Initializes Pokémon Subscription Options.', false);
    }
    if(MAIN.config.PVP.Subscriptions == 'ENABLED'){
      help.addField('`'+prefix+'pvp`', 'Initializes Pokémon PvP Subscription Options.', false);
    }
    if(MAIN.config.QUEST.Subscriptions == 'ENABLED'){
      help.addField('`'+prefix+'quest` |  `'+prefix+'q` ', 'Initializes Quest Subscription Options.', false);
    }
    if(MAIN.config.RAID.Subscriptions == 'ENABLED'){
      help.addField('`'+prefix+'raid` |  `'+prefix+'r` ', 'Initializes Raid Subscription Options.', false);
    }
    if(MAIN.config.LURE.Subscriptions == 'ENABLED'){
      help.addField('`'+prefix+'lure` |  `'+prefix+'l` ', 'Initializes Lure Subscription Options.', false);
    }
    if(MAIN.config.INVASION.Subscriptions == 'ENABLED'){
      help.addField('`'+prefix+'invasion` |  `'+prefix+'i` ', 'Initializes Team Rocket Invasion Subscription Options.', false);
    }
    help.addField('`'+prefix+'area`', 'Shows Area subscription options.', false)
    help.addField('`'+prefix+'pause` | `'+prefix+'resume`', 'Pause or Resume ALL subscription alerts.', false);
    if(MAIN.config.pmsfDB.Search == 'ENABLED'){
      help.addField('`'+prefix+'nest` |  `'+prefix+'n` ', 'Initializes Nest Search.', false);
    }
    help.addField('`'+prefix+'seen` |  `'+prefix+'s` ', 'Look up the # of sightings for a specific Pokémon.', false);
    help.addField('`'+prefix+'cp` ', 'Initializes perfect Pokémon CP string lookup.', false);
    help.addField('`'+prefix+'raidcp` ', 'Initializes raid Pokémon top CPs table.', false);
    help.addField('`'+prefix+'questcp` ', 'Initializes quest Pokémon top CPs table.', false);
    help.addField('`'+prefix+'dex` ', 'Initializes Pokedex search.', false);
    return message.channel.send(help).catch(console.error);

  // SPAM CHANNEL HELP
  } else if(discord.command_channels.indexOf(message.channel.id) >= 0){
    help.setColor('000044')
    help.setAuthor('Available Subscription Commands:')
    help.setDescription('Type a Command to view category options.');
    if(MAIN.config.POKEMON.Subscriptions == 'ENABLED'){
      help.addField('`'+prefix+'pokemon`  |  `'+prefix+'p`', 'Initializes Pokemon Subscription Options.', false);
    }
    if(MAIN.config.QUEST.Subscriptions == 'ENABLED'){
      help.addField('`'+prefix+'quest` |  `'+prefix+'q` ', 'Initializes Quest Subscription Options.', false);
    }
    if(MAIN.config.RAID.Subscriptions == 'ENABLED'){
      help.addField('`'+prefix+'raid` |  `'+prefix+'r` ', 'Initializes Raid Subscription Options.', false);
    }
    help.addField('`'+prefix+'area`', 'Shows Area subscription options.', false)
    help.addField('`'+prefix+'pause` | `'+prefix+'resume`', 'Pause or Resume ALL subscription alerts.', false);
    if(MAIN.config.pmsfDB.Search == 'ENABLED'){
      help.addField('`'+prefix+'nest` |  `'+prefix+'n` ', 'Initializes Nest Search.', false);
    }
    return message.channel.send(help).catch(console.error);

  // SPAM CHANNEL HELP
  } else if(discord.spam_channels.indexOf(message.channel.id) >= 0){
    help.setColor('000044')
    help.setAuthor('Available Spam Commands:')
    help.setDescription('Type a Command to view category options.');
    if(MAIN.config.pmsfDB.Search == 'ENABLED'){
      help.addField('`'+prefix+'nest` |  `'+prefix+'n` ', 'Initializes Nest Search.', false);
    }
    help.addField('`'+prefix+'seen` |  `'+prefix+'s` ', 'Look up the # of sightings for a specific Pokémon.', false);
    help.addField('`'+prefix+'cp` ', 'Initializes perfect Pokémon CP string lookup.', false);
    help.addField('`'+prefix+'raidcp` ', 'Initializes raid Pokemon top CPs table.', false);
    help.addField('`'+prefix+'questcp` ', 'Initializes quest Pokemon top CPs table.', false);
    help.addField('`'+prefix+'dex` ', 'Initializes Pokedex search.', false);
    return message.channel.send(help).catch(console.error);
  }
}
