module.exports = async (WDR, Functions, type, Member, Message, object, requirements, sub, AreaArray) => {
  return new Promise(resolve => {

    let huge_list = false,
      instruction = "";

    const filter = cMessage => cMessage.author.id == Message.author.id;
    const collector = Message.channel.createMessageCollector(filter, {
      time: 60000
    });

    let area_list = "",
      list_array = [],
      count = 0;

    if (AreaArray) {
      AreaArray.forEach((area, index) => {
        if (count == 50) {
          count = 0;
          list_array.push(area_list);
          area_list = "";
        }
        if (AreaArray.indexOf(area.toLowerCase()) >= 0) {
          area_list += area + " " + WDR.Emotes.checkYes + "\n";
        } else {
          area_list += area + "\n";
        }
        if (index == (AreaArray.length - 1)) {
          list_array.push(area_list);
        }
        count++;
      });
    }

    switch (type) {
      // AREA NAME EMBED
      case "Name":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Area would you like to Subscribe to?")
          .setDescription("**" + list_array[0] + "**" + "\n" + "\n" +
            "Page **1** of **" + list_array.length + "**")
          .setFooter(requirements);
        break;

        // REMOVAL EMBED
      case "Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Area do you want to remove?")
          .setDescription("**" + list_array[0] + "**" + "\n" + "\n" +
            "Page **1** of **" + list_array.length + "**")
          .setFooter(requirements);
        break;

      case "Area":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Do you want to change your DM Alert geofence type to Area-Based?")
          .setDescription("**Yes** - Your Alert geofence type will be changed to area-based." + "\n" +
            "\n" +
            "**No** - Nothing will change and you can continue to set your areas up." + "\n" +
            "\n" +
            "You will not lose your set location and can change back using the " + WDR.Config.PREFIX + "location command.")
          .setFooter(requirements);
        break;
    }

    Message.channel.send(instruction).catch(console.error).then(msg => {
      let page = 1;
      if (AreaArray.length > 50) {
        msg.react("⬅️");
        msg.react("➡️");
        WDR.Bot.on('messageReactionAdd', (reaction, user) => {
          if (reaction.message.id === msg.id && user.id != WDR.Bot.user.id) {
            let new_desc = new WDR.DiscordJS.MessageEmbed();
            if (reaction.emoji.name === "⬅️") {
              reaction.users.remove(user.id);
              if (page > 1) {
                page = page - 1;
                new_desc.setTitle(msg.embeds[0].title).setDescription("**" + list_array[(page - 1)] + "**" + "\n" + "\n" +
                  "Page **" + page + "** of **" + list_array.length + "**").setFooter(msg.embeds[0].footer.text);
                msg.edit(new_desc)
              }
            } else if (reaction.emoji.name === "➡️") {
              reaction.users.remove(user.id);
              if (page < list_array.length) {
                page = page + 1;
                new_desc.setTitle(msg.embeds[0].title).setDescription("**" + list_array[(page - 1)] + "**" + "\n" + "\n" +
                  "Page **" + page + "** of **" + list_array.length + "**").setFooter(msg.embeds[0].footer.text);
                msg.edit(new_desc);
              }
            } else {
              reaction.remove();
            }
          }
        });
      }

      // FILTER COLLECT EVENT
      collector.on("collect", CollectedMsg => {

        CollectedMsg.delete();

        switch (true) {
          case CollectedMsg.content.toLowerCase() == "cancel":
            collector.stop("cancel");
            break;

            // AREA NAME
          case type.indexOf("Name") >= 0:
          case type.indexOf("Remove") >= 0:
            if (CollectedMsg.content.toLowerCase() == "all") {
              collector.stop("all");
              break;
            } else if (CollectedMsg.content.toLowerCase() == "reset") {
              collector.stop("reset");
              break;
            } else {
              for (let a = 0; a < AreaArray.length + 1; a++) {
                if (a == AreaArray.length) {
                  CollectedMsg.reply("`" + CollectedMsg.content + "` doesn\'t appear to be a valid Area. Please check the spelling and try again.").then(m => m.delete({
                    timeout: 5000
                  })).catch(console.error);
                  break;
                } else if (CollectedMsg.content.toLowerCase() == AreaArray[a].toLowerCase()) {
                  collector.stop(AreaArray[a]);
                  break;
                }
              }
            }
            break;
          case type.indexOf("Area") >= 0:
            if (CollectedMsg.content.toLowerCase() == "yes") {
              collector.stop(true);
            } else if (CollectedMsg.content.toLowerCase() == "no") {
              collector.stop(false);
            } else {
              Message.reply(CollectedMsg.content + " is not a valid entry. " + requirements);
            }
            break;
        }
      });

      // COLLECTOR ENDED
      collector.on("end", (collected, reason) => {

        msg.delete();

        switch (reason) {
          case "cancel":
            return Functions.Cancel(WDR, Functions, Message, Member, "Area");
          case "time":
            return Functions.TimedOut(WDR, Functions, Message, Member, "Area");
          default:
           return resolve(reason);
        }
      });
    });
  });
}