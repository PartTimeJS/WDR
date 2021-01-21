module.exports = (WDR, Functions, Message, Member, type) => {
    if (!type) {
        let subscription_cancel = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle('Your Subscription Has Timed Out.')
            .setDescription('Nothing has been Saved.');
        return Message.reply(subscription_cancel).then(m => m.delete({
            timeout: 10000
        })).catch(console.error);
    } else {
        let subscription_cancel = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle('Your ' + type + ' Subscription Has Timed Out.')
            .setDescription('Nothing has been Saved.');
        return Message.reply(subscription_cancel).then(m => m.delete({
            timeout: 10000
        })).catch(console.error);
    }
};