module.exports = (WDR, Message, Member) => {
  let subscription_cancel = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
    .setAuthor(Member.nickname, Member.user.displayAvatarURL())
    .setTitle("Your Subscription Has Timed Out.")
    .setDescription("Nothing has been Saved.")
    .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
  Message.channel.send(subscription_cancel).then(nMessage => {
    return option_collector(WDR, "time", Message, nMessage, Member);
  });
}