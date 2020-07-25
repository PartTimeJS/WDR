var Functions = {
  Add: require(__dirname + "/add.js"),
  Cancel: require(__dirname + "/../cancel.js"),
  DetailCollect: require(__dirname + "/collect_detail.js"),
  Distance: require(__dirname + "/distance.js"),
  OptionCollect: require(__dirname + "/collect_option.js"),
  Remove: require(__dirname + "/remove.js"),
  TimedOut: require(__dirname + "/../timedout.js"),
  View: require(__dirname + "/view.js"),
  Dir: __filename.split("/").slice(__dirname.split("/").length - 4).join("/")
}

module.exports = async (WDR, Message) => {

  var Member = Message.member ? Message.member : Message.author;

  if (Message.member.db.length > 1) {
    let choice = await Functions.DetailCollect(WDR, Functions, "Guild", Member, Message, Message.member.user_guilds, "Respond with the # of a Discord.", null);
    Member.db = Message.member.db[choice];
  } else {
    Member.db = Message.member.db;
  }

  let geofence = await WDR.Geofences.get(Message.Discord.geojson_file);

  if (!geofence) {
    return Message.reply("No geofence file has been set for this server. Contact a server admin if you think this is incorrect.").then(m => m.delete({
      timeout: 5000
    })).catch(console.error);
  }

  let AreaArray = [];
  await geofence.features.forEach((geofence, index) => {
    AreaArray.push(geofence.properties.name);
  });

  AreaArray.sort();

  let requestAction = new WDR.DiscordJS.MessageEmbed()
    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
    .setTitle("What would you like to do with your Area Subscriptions?")
    .setDescription("`distance`  »  Set your area to distance-based notifications." + "\n" +
      "`view`  »  View your Areas." + "\n" +
      "`add`  »  Add an Area." + "\n" +
      "`remove`  »  Remove an Area.")
    .setFooter("Type the action, no command prefix required.");

  Message.channel.send(requestAction).catch(console.error).then(BotMsg => {
    return Functions.OptionCollect(WDR, Functions, "start", Message, BotMsg, Member, AreaArray);
  });
}