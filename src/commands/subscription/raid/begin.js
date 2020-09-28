var Functions = {
    Cancel: require(__dirname + "/../cancel.js"),
    Create: require(__dirname + "/create.js"),
    DetailCollect: require(__dirname + "/collect_detail.js"),
    MatchCollect: require(__dirname + "/collect_match.js"),
    OptionCollect: require(__dirname + "/collect_option.js"),
    Preset: require(__dirname + "/preset.js"),
    Remove: require(__dirname + "/remove.js"),
    Status: require(__dirname + "/status.js"),
    TimedOut: require(__dirname + "/../timedout.js"),
    View: require(__dirname + "/view.js"),
    Dir: __filename.split("/").slice(__dirname.split("/").length - 4).join("/")
}

module.exports = async (WDR, Message) => {

    let Member = Message.member ? Message.member : Message.author;

    let gym_name_array = [];
    let gym_detail_array = [];

    let gym_collection = new WDR.DiscordJS.Collection();

    for (let ga = 0, galen = WDR.Gym_Array.length; ga < galen; ga++) {
        let gym = WDR.Gym_Array[ga];
        if (WDR.PointInGeoJSON.polygon(Message.discord.geofence, [gym.lon, gym.lat])) {
            let area = await WDR.Get_Areas(WDR, {
                latitude: gym.lat,
                longitude: gym.lon,
                discord: Message.discord,
                area: {}
            });
            let gym_name = "";
            if (area.sub) {
                gym_name = gym.name + " [" + area.sub + " - " + gym.lat + "," + gym.lon + "]";
            } else if (area.main) {
                gym_name = gym.name + " [" + area.main + " - " + gym.lat + "," + gym.lon + "]";
            } else {
                gym_name = gym.name + " [" + gym.lat + "," + gym.lon + "]";
            }
            gym_name_array.push(gym.name);
            gym_detail_array.push(gym_name);
            gym_collection.set(gym.name, gym);
        }
    }

    if (!Member.db.location && Member.db.geotype === 'location') {
        let alocation_error = new WDR.DiscordJS.MessageEmbed()
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle("You Alerts are set to location-based but you have no location set.")
            .setDescription("You need to set a location or change back to area-based using the area command before modifying alerts.");
        return Message.channel.send(request_action).catch(console.error).then(m => m.delete({
            timeout: 15000
        }));

    } else {
        let request_action = new WDR.DiscordJS.MessageEmbed()
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle("What would you like to do with your Raid Alerts?")
            .setDescription("`presets`  »  View quick preset Alerts." + "\n" +
                "`view`  »  View your Alerts.\n" +
                "`add`  »  Create a Simple Alert.\n" +
                "`remove`  »  Remove a Raid Alert.\n" +
                "`pause` or `resume`  »  Pause/Resume Raid Alerts Only.")
            .setFooter("Type the action, no command prefix required.");
        Message.channel.send(request_action).catch(console.error).then(BotMsg => {
            return Functions.OptionCollect(WDR, Functions, "start", Message, BotMsg, Member, gym_name_array, gym_detail_array, gym_collection);
        });
    }
}