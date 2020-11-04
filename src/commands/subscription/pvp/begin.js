var Functions = {
    Cancel: require(__dirname + '/../cancel.js'),
    Create: require(__dirname + '/create.js'),
    DetailCollect: require(__dirname + '/collect_detail.js'),
    Modify: require(__dirname + '/modify.js'),
    OptionCollect: require(__dirname + '/collect_option.js'),
    Preset: require(__dirname + '/preset.js'),
    Remove: require(__dirname + '/remove.js'),
    Status: require(__dirname + '/status.js'),
    TimedOut: require(__dirname + '/../timedout.js'),
    View: require(__dirname + '/view.js'),
    Dir: __filename.split('/').slice(__dirname.split('/').length - 4).join('/')
};

module.exports = async (WDR, Message) => {

    let Member = Message.member ? Message.member : Message.author;

    let request_action = new WDR.DiscordJS.MessageEmbed()
        .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
        .setTitle('What would you like to do with your PvP Subscriptions?')
        .setDescription('`presets`  »  View quick preset subscriptions.' + '\n' +
            '`view`  »  View your Subscriptions.' + '\n' +
            '`add`  »  Create a Simple Subscription.' + '\n' +
            '`remove`  »  Remove a pokemon Subscription.' + '\n' +
            '`edit`  »  Edit a Subscription.' + '\n' +
            '`pause` or `resume`  »  Pause/Resume PvP subscriptions Only.')
        .setFooter('Type the action, no command prefix required.');

    Message.channel.send(request_action).then(BotMsg => {
        return Functions.OptionCollect(WDR, Functions, 'start', Message, BotMsg, Member);
    });
};