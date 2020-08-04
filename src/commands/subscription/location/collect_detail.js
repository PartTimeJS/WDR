module.exports = (WDR, Functions, type, Member, Message, object, requirements, location) => {
  return new Promise(async resolve => {

    let instruction = "";

    const filter = cMessage => cMessage.author.id == Message.author.id;
    const collector = Message.channel.createMessageCollector(filter, {
      time: 60000
    });

    let location_names = "";
    if (Member.db.locations) {
      let locations = Object.keys(Member.db.locations).map(i => Member.db.locations[i]);
      locations.forEach((location, i) => {
        location_names += (i + 1) + " - " + location.name + "\n" +
          "　Radius: `" + location.radius + " km(s)`" + "\n";
      });
      location_names.split(0, -1);
    }

    switch (type) {
      case "Name":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Name do you want to give this new Location?")
          .setDescription("The name must be one-word. You can use a dash in the name." + "\n" +
            "Example: johns-house or home or work")
          .setFooter(requirements);
        break;

      case "Coords":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Enter the Coordinates for this location.")
          .setDescription("Example: 32.928357,-84.2342384" + "\n" +
            "**For Privacy Reasons**, your provided coordinates will be somewhat randomized. They will be within 500 feet of your provided coordinates but protect the exact location.")
          .setImage(location.static_map)
          .setFooter(requirements);
        break;

      case "Radius":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Enter the Distance (Km) from that point to receive notifications for.")
          .setDescription("The image below gives a visual representation for a 1-5km Radius")
          .setImage(location.static_map)
          .setFooter(requirements);
        break;

      case "Confirm":
        let body = await generate_body(WDR, Message, location);
        let static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + body;
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Does this all look Correct?")
          .setDescription("Name: `" + location.name + "`" + "\n" +
            "Coords: `" + location.coords + "`" + "\n" +
            "Radius: `" + location.radius + " km(s)`")
          .setImage(static_map)
          .setFooter(requirements);
        break;

      case "Active":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Do you want this to be your current active location?")
          .setDescription("This will only take affect after confirmation.")
          .setFooter(requirements);
        break;

      case "Set":
      case "Remove":
      case "Modify":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Which Location do you want to " + type + "?")
          .setDescription("**" + location_names + "**")
          .setFooter(requirements);
        break;

      case "Area":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Do you want to change your DM Alert geofence type to Location-Based?")
          .setDescription("**Yes** - Your Alert geofence type will be changed to location-based." + "\n" +
            "\n" +
            "**No** - Nothing will change and you can continue to set your locations up." + "\n" +
            "\n" +
            "You will not lose your set Areas and can change back using the " + WDR.Config.PREFIX + "area command." + "\n" +
            "\n" +
            "**NOTE:** You will need to set up a location in order to receive DM Alerts.")
          .setFooter(requirements);
        break;
    }

    Message.channel.send(instruction).catch(console.error).then(CollectorMsg => {

      collector.on("collect", async CollectedMsg => {

        CollectedMsg.delete();

        switch (true) {
          case CollectedMsg.content.toLowerCase() == "cancel":
            collector.stop("cancel");
            break;

            // AREA NAME
          case type.indexOf("Name") >= 0:
            let name = await WDR.Capitalize(CollectedMsg.content)
            collector.stop(name);
            break;

          case type.indexOf("Coords") >= 0:
            if (CollectedMsg.content.split(" ").length > 1) {
              Message.reply(requirements);
            } else if (CollectedMsg.content.split(",").length > 1) {
              let randoNum1 = Math.floor(Math.random() * Math.floor(10));
              let randoNum2 = Math.floor(Math.random() * Math.floor(10));
              let coords = CollectedMsg.content.split(",");
              let priv_coords = parseFloat(coords[0]).toFixed(4) + randoNum1 + "," + parseFloat(coords[1]).toFixed(4) + randoNum2;
              collector.stop(priv_coords);
            } else {
              Message.reply(CollectedMsg + " is not a valid entry. " + requirements);
            }
            break;

          case type.indexOf("Radius") >= 0:
            if (isNaN(CollectedMsg.content)) {
              Message.reply(CollectedMsg + " is not a valid entry. " + requirements);
            } else if (CollectedMsg.content >= 1 && CollectedMsg.content <= 5) {
              collector.stop(CollectedMsg.content);
            } else {
              Message.reply(CollectedMsg.content + " is not a valid entry. " + requirements);
            }
            break;

          case type.indexOf("Confirm") >= 0:
          case type.indexOf("Active") >= 0:
          case type.indexOf("Area") >= 0:
            if (CollectedMsg.content.toLowerCase() == "yes") {
              collector.stop(true);
            } else if (CollectedMsg.content.toLowerCase() == "no") {
              collector.stop(false);
            } else {
              Message.reply(CollectedMsg.content + " is not a valid entry. " + requirements);
            }
            break;

          case type.indexOf("Set") >= 0:
          case type.indexOf("Remove") >= 0:
          case type.indexOf("Modify") >= 0:
            if (isNaN(CollectedMsg.content)) {
              Message.reply(CollectedMsg + " is not a valid entry. " + requirements);
            } else if (CollectedMsg.content >= 1 || CollectedMsg.content <= locations.length) {
              collector.stop(CollectedMsg.content - 1);
            } else {
              Message.reply(CollectedMsg.content + " is not a valid entry. " + requirements);
            }
            break;


        }
      });

      // COLLECTOR ENDED
      collector.on("end", (collected, arg) => {

        CollectorMsg.delete();

        switch (arg) {
          case "cancel":
            return Functions.Cancel(WDR, Functions, Message, Member, "Location");
          case "time":
            return Functions.TimedOut(WDR, Functions, Message, Member, "Location");
          default:
            return resolve(arg);
        }
      });
    });
  });
}

async function generate_body(WDR, Message, location) {
  return new Promise(resolve => {
    Message.channel.send("<a:loading:421047508605599744> Generating Location Preview...").catch(console.error).then(async loadingMsg => {

      let sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/map/circle_geofence/" + location.radius + "km.png";

      let zoom = "";
      if (location.radius == 1) {
        zoom = 14;
      } else if (location.radius == 2) {
        zoom = 13;
      } else if (location.radius == 3) {
        zoom = 13;
      } else if (location.radius == 4) {
        zoom = 12;
      } else if (location.radius == 5) {
        zoom = 12;
      }

      let body = await WDR.Generate_Tile(WDR, location, "location", location.coords.split(",")[0], location.coords.split(",")[1], sprite, null, zoom);
      loadingMsg.delete();
      return resolve(body);
    });
  });
}