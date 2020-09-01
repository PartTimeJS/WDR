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
    let command_channel_help = new WDR.DiscordJS.MessageEmbed().setColor("000044")
      .setTitle("Available Subscription Commands:")
      .setDescription("" +
        "**" + WDR.Config.PREFIX + "pokemon**　or　**" + WDR.Config.PREFIX + "p**" + "\n" +
        "　Initializes Pokemon Subscription Options." + "\n" +
        "**" + WDR.Config.PREFIX + "pvp**" + "\n" +
        "　Initializes PvP Subscription Options." + "\n" +
        "**" + WDR.Config.PREFIX + "raid**　or　**" + WDR.Config.PREFIX + "r**" + "\n" +
        "　Initializes Raid Subscription Options." + "\n" +
        "**" + WDR.Config.PREFIX + "location**　or　**" + WDR.Config.PREFIX + "l**" + "\n" +
        "　Set DM Alerts based on distance from Custom Set Locations." + "\n" +
        //"**" + WDR.Config.PREFIX + "lset <location>**" + "\n" +
        //"　Shortcut command to set one of your saved locations." + "\n" +
        "**" + WDR.Config.PREFIX + "area**　or　**" + WDR.Config.PREFIX + "a**" + "\n" +
        "　Set DM Alerts based on Area Geofences." + "\n" +
        "**" + WDR.Config.PREFIX + "pause**　or　**" + WDR.Config.PREFIX + "resume**" + "\n" +
        "　Pause or Resume ALL subscription alerts.");
    return Message.channel.send(command_channel_help).catch(console.error);



  } else if (Message.Discord.command_channels.indexOf(Message.channel.id) >= 0) {

    let command_channel_help = new WDR.DiscordJS.MessageEmbed().setColor("000044")
      .setTitle("Available Subscription Commands:")
      .setDescription("" +
        "**" + WDR.Config.PREFIX + "pokemon**　or　**" + WDR.Config.PREFIX + "p**" + "\n" +
        "　Initializes Pokemon Subscription Options." + "\n" +
        "**" + WDR.Config.PREFIX + "pvp**" + "\n" +
        "　Initializes PvP Subscription Options." + "\n" +
        "**" + WDR.Config.PREFIX + "raid**　or　**" + WDR.Config.PREFIX + "r**" + "\n" +
        "　Initializes Raid Subscription Options." + "\n" +
        "**" + WDR.Config.PREFIX + "location**　or　**" + WDR.Config.PREFIX + "l**" + "\n" +
        "　Set DM Alerts based on distance from Custom Set Locations." + "\n" +
        //"**" + WDR.Config.PREFIX + "lset <location>**" + "\n" +
        //"　Shortcut command to set one of your saved locations." + "\n" +
        "**" + WDR.Config.PREFIX + "area**　or　**" + WDR.Config.PREFIX + "a**" + "\n" +
        "　Set DM Alerts based on Area Geofences." + "\n" +
        "**" + WDR.Config.PREFIX + "pause**　or　**" + WDR.Config.PREFIX + "resume**" + "\n" +
        "　Pause or Resume ALL subscription alerts.");
    return Message.channel.send(command_channel_help).catch(console.error);



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