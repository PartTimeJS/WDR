module.exports = (WDR, Functions, type, Member, Message, object, requirements, sub, available_gyms, discord, gym_collection) => {
  return new Promise(async resolve => {

    let options = "";

    const filter = cMessage => cMessage.author.id == Message.author.id;
    const collector = Message.channel.createMessageCollector(filter, {
      time: 60000
    });

    switch (type) {

      case "Matches":
        let match_desc = "";
        for (let ma = 0, malen = object.length; ma < malen; ma++) {
          let match = object[ma];
          match_desc += (index + 1) + ". " + match + "\n";
        }
        if (match_desc.length > 2000) {
          match_desc = match_desc.slice(0, 1950) + "\n**There are too many matches to display.**";
        }
        options = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Possible matches for '" + sub.gym.fuzzy + "' were Found:")
          .setDescription(match_desc)
          .setFooter("Type the number of the gym you wish to select or type 'cancel'.");
        break;


      case "Multiple":
        let description = "";
        for (let mu = 0, mulen = object.length; mu < mulen; mu++) {
          let match = object[mu];
          match.Discord = Message.Discord;
          let match_area = await WDR.Get_Area(WDR, match);
          let match_name = "";
          if (area.sub) {
            match_name = match.name + " [" + area.sub + " - " + match.lat + "," + match.lon + "]";
          } else if (area.main) {
            match_name = match.name + " [" + area.main + " - " + match.lat + "," + match.lon + "]";
          } else {
            match_name = match.name + " [" + match.lat + "," + match.lon + "]";
          }
          description += (mu + 1) + " - " + match_name + "\n";
        }
        if (description.length > 2000) {
          description = description.slice(0, 1950) + "**\nThere are too many to display. Try to narrow your search terms.**";
        }
        options = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Multiple Gym Matches were Found:").setDescription("**" + description + "**")
          .setFooter("Type the number of the gym you wish to select or type 'cancel'.");
        break;
    }

    Message.channel.send(options).catch(console.error).then(msg => {

      collector.on("collect", message => {

        let num = parseInt(CollectedMsg.content);

        switch (true) {
          case (isNaN(CollectedMsg.content)):
            CollectedMsg.reply("`" + CollectedMsg.content + "` is not a Number. " + requirements).then(m => m.delete({
              timeout: 5000
            }));
          case (num > 0 && num <= object.length):
            collector.stop((num - 1));
          default:
            CollectedMsg.reply("`" + CollectedMsg.content + "` is not a valid # selection. " + requirements).then(m => m.delete({
              timeout: 5000
            }));
        }
      });

      collector.on("end", (collected, reason) => {
        msg.delete();
        return resolve(reason);
      });
    });
  });
}