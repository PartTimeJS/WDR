module.exports = async (WDR, Functions, type, Member, Message, object, requirements, sub, AreaArray) => {
  return new Promise(function(resolve, reject) {

    let timeout = true,
      instruction = "";

    const filter = cMessage => cMessage.author.id == Message.author.id;
    const collector = Message.channel.createMessageCollector(filter, {
      time: 60000
    });

    let user_areas = sub.toLowerCase().split(","),
      area_list = "";
    // CREATE REWARD LIST AND ADD CHECK FOR SUBSCRIBED REWARDS
    AreaArray.forEach((area, index) => {
      if (user_areas.indexOf(area.toLowerCase()) >= 0) {
        area_list += area + " " + WDR.Emotes.checkYes + "\n";
      } else {
        area_list += area + "\n";
      }
    });

    switch (type) {

      // AREA NAME EMBED
      case "Name":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Area would you like to Subscribe to?")
          .setDescription("**" + area_list + "**", false)
          .setFooter(requirements);
        break;

        // REMOVAL EMBED
      case "Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Area do you want to remove?")
          .addField("Your Areas:", "**" + area_list + "**", false)
          .setFooter(requirements);
        break;
    }

    Message.channel.send(instruction).catch(console.error).then(msg => {

      // FILTER COLLECT EVENT
      collector.on("collect", CollectedMessage => {
        switch (true) {
          case CollectedMessage.content.toLowerCase() == "cancel":
            collector.stop("cancel");
            break;

            // AREA NAME
          case type.indexOf("Name") >= 0:
          case type.indexOf("Remove") >= 0:
            if (CollectedMessage.content.toLowerCase() == "all") {
              collector.stop("all");
              break;
            }
            for (let a = 0; a < AreaArray.length + 1; a++) {
              if (a == AreaArray.length) {
                CollectedMessage.reply("`" + CollectedMessage.content + "` doesn\'t appear to be a valid Area. Please check the spelling and try again.").then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
                break;
              } else if (CollectedMessage.content.toLowerCase() == AreaArray[a].toLowerCase()) {
                collector.stop(AreaArray[a]);
                break;
              }
            }
            break;
        }
      });

      // COLLECTOR ENDED
      collector.on("end", (collected, reason) => {
        msg.delete();
        resolve(reason);
      });
    });
  });
}