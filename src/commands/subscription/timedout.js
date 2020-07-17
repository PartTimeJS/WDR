module.exports = (WDR, Functions, Message, Member) => {
  let subscription_cancel = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
    .setTitle("Your Subscription Has Timed Out.")
    .setDescription("Nothing has been Saved.");
  return Message.channel.send(subscription_cancel).then(m => m.delete({
    timeout: 5000
  })).catch(console.error);
}