var Functions = {
    Create: require(__dirname + '/create.js'),
    Cancel: require(__dirname + '/../cancel.js'),
    DetailCollect: require(__dirname + '/collect_detail.js'),
    Remove: require(__dirname + '/remove.js'),
    OptionCollect: require(__dirname + '/collect_option.js'),
    Modify: require(__dirname + '/modify.js'),
    TimedOut: require(__dirname + '/../timedout.js'),
    Set: require(__dirname + '/set.js'),
    View: require(__dirname + '/view.js'),
    Dir: __filename.split('/').slice(__dirname.split('/').length - 4).join('/')
};

module.exports = async (WDR, Message) => {

    var Member = Message.member ? Message.member : Message.author;

    if (Member.db.geotype != 'location') {
        let location = await Functions.DetailCollect(WDR, Functions, 'Area', Member, Message, Member.db, 'Type \'Yes\' or \'No\'.');
        if (location == false) {
            let location_keep = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                .setAuthor(Message.member.db.user_name, Message.member.user.displayAvatarURL())
                .setTitle('You have chose to keep Area-Based DM Alerts.')
                .setFooter('You can modify your area-based settings by using the \'' + WDR.Config.PREFIX + 'area\' command.');
            Message.reply(location_keep).then(m => m.delete({
                timeout: 10000
            })).catch(console.error);
        } else {
            WDR.wdrDB.query(`
        UPDATE
            wdr_users
        SET
            geotype = 'location'
        WHERE
            user_id = ${Member.id}
      ;`);
            let location_keep = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                .setAuthor(Message.member.db.user_name, Message.member.user.displayAvatarURL())
                .setTitle('DM Alerts are now set to location-based.')
                .setDescription('You will need to set up locations and set your active location in order to receive DM Alerts.');
            Message.reply(location_keep).then(m => m.delete({
                timeout: 5000
            })).catch(console.error);
        }
    }

    let requestAction = new WDR.DiscordJS.MessageEmbed()
        .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
        .setTitle('What would you like to do with your Locations?')
        .setDescription('`view`  »  View your Locations.' + '\n' +
            '`set`  »  Set your Current Location.' + '\n' +
            '`create`  »  Create a Location.' + '\n' +
            '`edit`  »  Edit a Location.' + '\n' +
            '`remove`  »  Remove a Location.')
        .setFooter('Type the action, no command prefix required.');

    Message.channel.send(requestAction).catch(console.error).then(BotMsg => {
        return Functions.OptionCollect(WDR, Functions, 'start', Message, BotMsg, Member);
    });
};