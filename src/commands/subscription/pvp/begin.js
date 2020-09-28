var Functions = {
    Cancel: require(__dirname + "/../cancel.js"),
    Create: require(__dirname + "/create.js"),
    DetailCollect: require(__dirname + "/collect_detail.js"),
    Modify: require(__dirname + "/modify.js"),
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
            .setTitle("What would you like to do with your PvP Alerts?")
            .setDescription("`presets`  »  View quick preset Alerts." + "\n" +
                "`view`  »  View your Alerts." + "\n" +
                "`add`  »  Create a Simple Alert." + "\n" +
                "`remove`  »  Remove a pokemon Alert." + "\n" +
                "`edit`  »  Edit a Alert." + "\n" +
                "`pause` or `resume`  »  Pause/Resume PvP Alerts Only.")
            .setFooter("Type the action, no command prefix required.");
        Message.channel.send(request_action).then(BotMsg => {
            return Functions.OptionCollect(WDR, Functions, "start", Message, BotMsg, Member);
        });
    }
}