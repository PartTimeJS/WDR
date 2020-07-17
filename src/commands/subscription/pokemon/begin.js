var Functions = {
  Cancel: require(__dirname + "/../cancel.js"),
  Create: require(__dirname + "/create.js"),
  DetailCollect: require(__dirname + "/collect_detail.js"),
  Modify: require(__dirname + "/modify.js"),
  OptionCollect: require(__dirname + "/collect_option.js"),
  Preset: require(__dirname + "/preset.js"),
  Remove: require(__dirname + "/remove.js"),
  Status: require(__dirname + "/status.js"),
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

  let request_action = new WDR.DiscordJS.MessageEmbed()
    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
    .setTitle("What would you like to do with your Pokémon Subscriptions?")
    .setDescription("`presets`  »  View quick preset subscriptions." + "\n" +
      "`view`  »  View your Subscriptions." + "\n" +
      "`add`  »  Create a Simple Subscription." + "\n" +
      "`add adv`  »  Create an Advanced Subscription." + "\n" +
      "`remove`  »  Remove a Pokémon Subscription." + "\n" +
      "`edit`  »  Edit a Subscription." + "\n" +
      "`pause` or `resume`  »  Pause/Resume Pokémon Subscriptions Only.")
    .setFooter("Type the action, no command prefix required.");

  Message.channel.send(request_action).catch(console.error).then(BotMsg => {
    return Functions.OptionCollect(WDR, Functions, "start", Message, BotMsg, Member);
  });
}