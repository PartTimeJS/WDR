module.exports = async (WDR, message, prefix, discord) => {

  // DECLARE VARIABLES FOR USER
  let Member = "";
  if (Message.member) {
    Member = Message.member;
  } else {
    Member = Message.author;
  }

  switch (true) {
    case Member.nickname:
      break;
    case Message.author.username:
      break;
  }

  Member.db = Message.Member.db;

  if (!Member.nickname) {
    Member.nickname = Message.author.username;
  } else {
    Member.nickname = Message.author.username;
  }

  let request_action = new WDR.DiscordJS.MessageEmbed()
    .setAuthor(Member.nickname, Member.author.displayAvatarURL)
    .setTitle("What would you like to do with your Raid Subscriptions?")
    .setDescription("`presets`  »  View quick preset subscriptions." + "\n" +
      "`view`  »  View your Subscritions.\n" +
      "`add`  »  Create a Simple Subscription.\n" +
      "`remove`  »  Remove a Raid Subscription.\n" +
      "`pause` or `resume`  »  Pause/Resume Raid Subscriptions Only.")
    .setFooter("Type the action, no command prefix required.");

  message.channel.send(request_action).catch(console.error).then(msg => {
    return initiate_collector(WDR, "start", message, msg, member, prefix, available_gyms, discord, gym_collection);
  });
}