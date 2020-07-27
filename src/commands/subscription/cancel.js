module.exports = (WDR, Functions, Message, Member, type) => {
  if (!type) {
    let subscription_cancel = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
      .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
      .setTitle("Subscription Cancelled.")
      .setDescription("Nothing has been Saved.")
    return Message.channel.send(subscription_cancel).then(m => m.delete({
      timeout: 5000
    })).catch(console.error);
  } else {
    let subscription_cancel = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
      .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
      .setTitle(type + " Subscription Cancelled.")
      .setDescription("Nothing has been Saved.")
    return Message.channel.send(subscription_cancel).then(m => m.delete({
      timeout: 5000
    })).catch(console.error);
  }
}