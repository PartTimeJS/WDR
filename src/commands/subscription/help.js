const Discord = require("discord.js");

module.exports = async (WDR, Message) => {
  let help = new WDR.DiscordJS.MessageEmbed();

  // COMMAND CHANNEL HELP
  // if ((Message.Discord.command_channels.indexOf(Message.channel.id) >= 0 && Message.Discord.spam_channels.indexOf(Message.channel.id) < 0) || Message.channel.type == "dm") {
  //
  //   embed = Embed_Config(WDR, match);
  //
  //   return Message.channel.send(help).catch(console.error);
  //
  //   // SPAM CHANNEL HELP
  // } else
  if (Message.Discord.command_channels.indexOf(Message.channel.id) >= 0) {
    help.setColor("000044")
    help.setAuthor("Available Subscription Commands:");
    help.setDescription("Type a Command to view category options.");
    help.addField("`" + WDR.Config.PREFIX + "pokemon`　|　`" + WDR.Config.PREFIX + "p`", "Initializes Pokemon Subscription Options.", false);
    help.addField("`" + WDR.Config.PREFIX + "pvp`", "Initializes PvP Subscription Options.", false);
    // help.addField("`" + WDR.Config.PREFIX + "quest` |  `" + WDR.Config.PREFIX + "q` ", "Initializes Quest Subscription Options.", false);
    // help.addField("`" + WDR.Config.PREFIX + "raid` |  `" + WDR.Config.PREFIX + "r` ", "Initializes Raid Subscription Options.", false);
    help.addField("`" + WDR.Config.PREFIX + "area`", "Shows Area subscription options.", false);
    help.addField("`" + WDR.Config.PREFIX + "pause` | `" + WDR.Config.PREFIX + "resume`", "Pause or Resume ALL subscription alerts.", false);
    return Message.channel.send(help).catch(console.error);

    // SPAM CHANNEL HELP
  } else if (Message.Discord.spam_channels.indexOf(Message.channel.id) >= 0) {
    help.setColor("000044")
    help.setAuthor("Available Spam Commands:")
    help.setDescription("Type a Command to view category options.");
    if (WDR.config.pmsfDB.Search == "ENABLED") {
      help.addField("`" + WDR.Config.PREFIX + "nest` |  `" + WDR.Config.PREFIX + "n` ", "Initializes Nest Search.", false);
    }
    help.addField("`" + WDR.Config.PREFIX + "seen` |  `" + WDR.Config.PREFIX + "s` ", "Look up the # of sightings for a specific Pokémon.", false);
    help.addField("`" + WDR.Config.PREFIX + "cp` ", "Initializes perfect Pokémon CP string lookup.", false);
    help.addField("`" + WDR.Config.PREFIX + "raidcp` ", "Initializes raid Pokemon top CPs table.", false);
    help.addField("`" + WDR.Config.PREFIX + "questcp` ", "Initializes quest Pokemon top CPs table.", false);
    help.addField("`" + WDR.Config.PREFIX + "dex` ", "Initializes Pokedex search.", false);
    return Message.channel.send(help).catch(console.error);
  }
}