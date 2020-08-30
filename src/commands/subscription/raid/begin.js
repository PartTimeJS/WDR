var Functions = {
  Cancel: require(__dirname + "/../cancel.js"),
  Create: require(__dirname + "/create.js"),
  DetailCollect: require(__dirname + "/collect_detail.js"),
  MatchCollect: require(__dirname + "/collect_match.js"),
  OptionCollect: require(__dirname + "/collect_option.js"),
  Preset: require(__dirname + "/preset.js"),
  Remove: require(__dirname + "/remove.js"),
  Status: require(__dirname + "/status.js"),
  TimedOut: require(__dirname + "/../timedout.js"),
  View: require(__dirname + "/view.js"),
  Dir: __filename.split("/").slice(__dirname.split("/").length - 4).join("/")
}

module.exports = async (WDR, Message) => {

  let Member = Message.member ? Message.member : Message.author;

  let available_gyms = [];
  let gym_collection = new WDR.DiscordJS.Collection();

  for (let ga = 0, galen = WDR.Gym_Array.length; ga < galen; ga++) {
    let gym = WDR.Gym_Array[ga];
    if (WDR.PointInGeoJSON.polygon(Message.Discord.geofence, [gym.lon, gym.lat])) {
      let area = await WDR.Get_Areas(WDR, {
        latitude: gym.lat,
        longitude: gym.lon,
        Discord: Message.Discord,
        area: {}
      });
      let gym_name = "";
      if (area.sub) {
        gym_name = gym.name + " [" + area.sub + " - " + gym.lat + "," + gym.lon + "]";
      } else if (area.main) {
        gym_name = gym.name + " [" + area.main + " - " + gym.lat + "," + gym.lon + "]";
      } else {
        gym_name = gym.name + " [" + gym.lat + "," + gym.lon + "]";
      }
      available_gyms.push(gym_name);
      gym_collection.set(gym_name, gym);
    }
  }

  let request_action = new WDR.DiscordJS.MessageEmbed()
    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
    .setTitle("What would you like to do with your Raid Subscriptions?")
    .setDescription("`presets`  »  View quick preset subscriptions." + "\n" +
      "`view`  »  View your Subscritions.\n" +
      "`add`  »  Create a Simple Subscription.\n" +
      "`remove`  »  Remove a Raid Subscription.\n" +
      "`pause` or `resume`  »  Pause/Resume Raid Subscriptions Only.")
    .setFooter("Type the action, no command prefix required.");

  Message.channel.send(request_action).catch(console.error).then(BotMsg => {
    return Functions.OptionCollect(WDR, Functions, "start", Message, BotMsg, Member, available_gyms, gym_collection);
  });
}