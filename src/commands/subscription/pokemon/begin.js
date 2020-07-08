let Status = require(__dirname + "/status.js");
let View = require(__dirname + "/view.js");
let Create = require(__dirname + "/create.js");
let Remove = require(__dirname + "/remove.js");
let Modify = require(__dirname + "/modify.js");
let Option_Collector = require(__dirname + "/option_collector.js");

module.exports = async (WDR, Message, Discord) => {

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

  Member.db = Message.member.db;

  if (!Member.nickname) {
    Member.nickname = Message.author.username;
  } else {
    Member.nickname = Message.author.username;
  }

  let requestAction = new WDR.DiscordJS.MessageEmbed()
    .setAuthor(Member.nickname, Member.user.displayAvatarURL())
    .setTitle("What would you like to do with your Pokémon Subscriptions?")
    .setDescription("`presets`  »  View quick preset subscriptions." + "\n" +
      "`view`  »  View your Subscriptions." + "\n" +
      "`add`  »  Create a Simple Subscription." + "\n" +
      "`add adv`  »  Create an Advanced Subscription." + "\n" +
      "`remove`  »  Remove a Pokémon Subscription." + "\n" +
      "`edit`  »  Edit a Subscription." + "\n" +
      "`pause` or `resume`  »  Pause/Resume Pokémon Subscriptions Only.")
    .setFooter("Type the action, no command prefix required.");

  Message.channel.send(requestAction).catch(console.error).then(BotMsg => {
    return Option_Collector(WDR, "start", Message, BotMsg, Member);
  });
}