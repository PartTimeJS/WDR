var Functions = {
  Add: require(__dirname + "/add.js"),
  Cancel: require(__dirname + "/../cancel.js"),
  DetailCollect: require(__dirname + "/collect_detail.js"),
  OptionCollect: require(__dirname + "/collect_option.js"),
  Remove: require(__dirname + "/remove.js"),
  TimedOut: require(__dirname + "/../timedout.js"),
  View: require(__dirname + "/view.js"),
  Dir: __filename.split("/").slice(__dirname.split("/").length - 4).join("/")
}

module.exports = async (WDR, Message) => {

  var Member = Message.member ? Message.member : Message.author;

  let geofence = await WDr.Geofences.get(Message.Discord.geojson_file);

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

  if (Member.db.geotype != "areas") {
    let keep_location = await Functions.DetailCollect(WDR, Functions, "Area", Member, Message, Member.db, "Type 'Yes' to override and continue or 'No' to cancel and keep area-based subscriptions.");
    if (keep_location == true) {
      let kept_location = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
        .setAuthor(Message.member.db.user_name, Message.member.user.displayAvatarURL())
        .setTitle("You have chose to keep **Location-Based** notifications.")
        .setFooter("You can modify your location-based settings by using the '" + WDR.Config.PREFIX + "location' command.");
      return Message.reply(kept_location).then(m => m.delete({
        timeout: 10000
      })).catch(console.error);
    } else {
      let now_area = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
        .setAuthor(Message.member.db.user_name, Message.member.user.displayAvatarURL())
        .setTitle("You have changed to **Area-Based** notifications.");
      return Message.reply(now_area).then(m => m.delete({
        timeout: 5000
      })).catch(console.error);
    }
  }

  let requestAction = new WDR.DiscordJS.MessageEmbed()
    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
    .setTitle("What would you like to do with your Area Subscriptions?")
    .setDescription("`view`  »  View your Areas." + "\n" +
      "`add`  »  Add an Area." + "\n" +
      "`remove`  »  Remove an Area.")
    .setFooter("Type the action, no command prefix required.");

  Message.channel.send(requestAction).catch(console.error).then(BotMsg => {
    return Functions.OptionCollect(WDR, Functions, "start", Message, BotMsg, Member, AreaArray);
  });
}