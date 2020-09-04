module.exports = (WDR, Functions, type, Member, Message, object, requirements, sub, gym_name_array, gym_detail_array, gym_collection) => {
  return new Promise(async resolve => {

    let timeout = true,
      instruction = "";

    const filter = cMessage => cMessage.author.id == Message.author.id;
    const collector = Message.channel.createMessageCollector(filter, {
      time: 60000
    });

    switch (type) {


      case "Preset":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Choose a Preset Subscription:")
          .setDescription(object)
          .setFooter(requirements);
        break;


      case "Name":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Which would you like to Subscribe to?")
          .setDescription("Choices:" +
            "　**Pokemon Name**　-　Only that Boss." + "\n" +
            "　'**Boss**'　-　All Raid Bosses only." + "\n" +
            "　'**Egg**'　-　All Eggs only." + "\n" +
            "　'**All**'　-　All Bosses and Eggs.")
          .setFooter(requirements);
        break;


      case "Gym":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Which Gym would you like to Subscribe to?")
          .setFooter(requirements);
        break;


      case "Confirm-Add":

        console.log(sub)

        let gym = "";
        if (sub.gym === 0) {
          gym = "All";
        } else {
          gym = sub.gym;
        }

        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Does all of this look correct?")
          .setDescription("Boss: `" + sub.boss + "`\n" +
            "Gym: `" + gym + "`\n" +
            "Min Lvl: `" + sub.min_lvl + "`\n" +
            "Max Lvl: `" + sub.max_lvl + "`\n" +
            "Areas: `" + sub.areas + "`")
          .setFooter(requirements);
        break;


      case "Confirm-Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Are you sure you want to Remove ALL of your subscriptions?")
          .setFooter(requirements);
        break;


      case "Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Which Raid Subscription do you want to remove?")
          .setDescription(object)
          .setFooter(requirements);
        break;


      case type.indexOf("Form") >= 0:
        switch (true) {
          case (CollectedMsg.content.toLowerCase() == "same"):
          case (CollectedMsg.content.toLowerCase() == "keep"):
          case (CollectedMsg.content.toLowerCase() == "next"):
            collector.stop(object);
            break;
          case (CollectedMsg.content.toLowerCase() == "all" || CollectedMsg.content === '0'):
            collector.stop(0);
            break;
          case (parseInt(CollectedMsg.content) >= 0 && parseInt(CollectedMsg.content) <= sub.forms.length):
            collector.stop(sub.form_ids[sub.forms.indexOf(sub.forms[CollectedMsg.content - 1])]);
            break;
          default:
            return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a valid # selection. " + requirements).then(m => m.delete({
              timeout: 5000
            }));
        }
        break;


      case type.indexOf("Form") >= 0:
        switch (true) {
          case (CollectedMsg.content.toLowerCase() == "same"):
          case (CollectedMsg.content.toLowerCase() == "keep"):
          case (CollectedMsg.content.toLowerCase() == "next"):
            collector.stop(object);
            break;
          case (CollectedMsg.content.toLowerCase() == "all" || CollectedMsg.content === '0'):
            collector.stop(0);
            break;
          case (parseInt(CollectedMsg.content) >= 0 && parseInt(CollectedMsg.content) <= sub.forms.length):
            collector.stop(sub.form_ids[sub.forms.indexOf(sub.forms[CollectedMsg.content - 1])]);
            break;
          default:
            return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a valid # selection. " + requirements).then(m => m.delete({
              timeout: 5000
            }));
        }
        break;


      case "Geofence":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Do you want to get notifications for " + sub.name + " filtered by your set Areas/Location?")
          .setDescription("**Yes** - Your notifications for this Pokémon will be filtered based on your set areas/location.\n" +
            "**No** - You will get notifications for this pokemon in the entire city scan area.")
          .setFooter(requirements);
        break;


      default:
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What **" + type + "** would you like to set for **" + sub.name + "** Notifications?")
          .setFooter(requirements);
    }

    Message.channel.send(instruction).catch(console.error).then(msg => {

      // DEFINED VARIABLES
      let input = "";

      // FILTER COLLECT EVENT
      collector.on("collect", async CollectedMsg => {

        try {
          CollectedMsg.delete();
        } catch (e) {

        }

        switch (true) {

          case CollectedMsg.content.toLowerCase() == "stop":
          case CollectedMsg.content.toLowerCase() == "cancel":
            collector.stop("cancel");
            break;


          case type.indexOf("Gym") >= 0:
            if (CollectedMsg.content.toLowerCase() == "all") {
              collector.stop(0);
            } else if (CollectedMsg.content.toLowerCase() == "egg") {
              collector.stop(-1);
            } else {
              let gquery = `
                SELECT
                    *
                FROM
                    gym
                WHERE
                    name = '${CollectedMsg.content.replace("'","")}'
                ;`
              WDR.scannerDB.query(
                gquery,
                async function(error, gyms, fields) {
                  if (error) {
                    WDR.Console.error(WDR, "[commands/pokemon.js] Error Querying Subscriptions.", [gquery, error]);
                  } else if (!gyms || gyms.length == 0) {
                    collector.stop({
                      fuzzy: CollectedMsg.content
                    });
                  } else {
                    for (let g = 0, glen = gyms.length; g < glen; g++) {
                      let gym = gyms[g];
                      if (!WDR.PointInGeoJSON.polygon(Message.discord.geofence, [gym.lon, gym.lat])) {
                        gyms.splice(index, 1);
                      }
                    }
                    if (gyms.length > 0) {
                      collector.stop(gyms);
                    } else {
                      collector.stop({
                        fuzzy: CollectedMsg.content
                      });
                    }
                  }
                }
              );
            }
            break;


          case type.indexOf("Geofence") >= 0:
            switch (CollectedMsg.content.toLowerCase()) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case "yes":
                collector.stop(Member.db.geotype);
                break;
              case "all":
              case "no":
                collector.stop("city");
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;


          case type.indexOf("Confirm-Add") >= 0:
          case type.indexOf("Confirm-Remove") >= 0:
            console.log(CollectedMsg.content)
            switch (CollectedMsg.content.toLowerCase()) {
              case "save":
              case "yes":
                collector.stop(true);
                break;
              case "no":
              case "cancel":
                collector.stop(false);
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;


          case "Form":
            let forms = "**0 - All**\n";
            for (let f = 0, flen = sub.forms.length; f < flen; f++) {
              forms += "**" + (f + 1) + " - " + sub.forms[f] + "**\n"
            }
            forms = forms.slice(0, -1);
            instruction = new WDR.DiscordJS.MessageEmbed()
              .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
              .setTitle("What Form of " + sub.name + " would you like to Subscribe to?")
              .setDescription(forms)
              .setFooter(requirements);
            if (object) {
              if (object.form == 0) {
                instruction.setDescription("Current: `All Pokémon`" + "\n" +
                  "Available Forms:" + "\n　" + forms);
              } else {
                instruction.setDescription("Current: `" + WDR.Master.Pokemon[object.pokemon_id].forms[object.form].form + "`" + "\n" +
                  "Available Forms:" + "\n　" + forms);
              }
            }
            break;


          case type.indexOf("Name") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                let old_data = await WDR.Pokemon_ID_Search(WDR, object.pokemon_id);
                collector.stop(old_data);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(-1);
                break;
              case (CollectedMsg.content.toLowerCase() == "boss"):
                collector.stop(0);
                break;
              case (CollectedMsg.content.toLowerCase() == "egg"):
                collector.stop(-2);
                break;
              default:
                let valid = await WDR.Pokemon_ID_Search(WDR, CollectedMsg.content.split(" ")[0]);
                if (valid) {
                  collector.stop(valid);
                } else {
                  return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn't appear to be a valid Pokémon name. Please check the spelling and try again.").then(m => m.delete({
                    timeout: 5000
                  }));
                }
            }
            break;


          case type.indexOf("Guild") >= 0:
          case type.indexOf("Preset") >= 0:
          case type.indexOf("Modify") >= 0:
          case type.indexOf("Remove") >= 0:
            let num = parseInt(CollectedMsg.content);
            switch (true) {
              case (isNaN(CollectedMsg.content)):
                return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a Number. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
              case (num > 0 && num <= object.length):
                return collector.stop((num - 1));
              default:
                return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a valid # selection. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;


          case type.indexOf("Level") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case (parseInt(CollectedMsg.content) > 0 && parseInt(CollectedMsg.content) <= WDR.Max_Raid_Level):
                collector.stop(parseInt(CollectedMsg.content));
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                if (type.indexOf("Minimum") >= 0) {
                  collector.stop(1);
                } else {
                  collector.stop(WDR.Max_Raid_Level);
                }
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;
        }
      });

      // COLLECTOR ENDED
      collector.on("end", (collected, reason) => {
        if (reason == null) {
          return;
        }
        if (msg && msg.channel.type != "dm") {
          try {
            msg.delete();
          } catch (e) {

          }
        }
        return resolve(reason);
      });
    });
  });
}