module.exports = (WDR, Functions, Message, Member) => {
  let timed_out = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
    .setTitle("Your Subscription Has Timed Out.")
    .setDescription("Nothing has been Saved.")
    .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
  return Message.channel.send(timed_out).then(m => m.delete({
    timeout: 5000
  }));
}