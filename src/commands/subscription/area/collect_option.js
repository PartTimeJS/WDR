module.exports = (WDR, Functions, source, oMessage, bMessage, Member, AreaArray) => {

    let BotMsg = bMessage;
    let OriginalMsg = oMessage;

    const filter = CollectedMsg => CollectedMsg.author.id == OriginalMsg.author.id;
    const collector = OriginalMsg.channel.createMessageCollector(filter, {
        time: 60000
    });

    // FILTER COLLECT EVENT
    collector.on('collect', CollectedMsg => {

        if (!CollectedMsg.content.startsWith(WDR.Config.PREFIX && BotMsg.channel.type != 'dm')) {
            try {
                CollectedMsg.delete();
            // eslint-disable-next-line no-empty
            } catch (e) {

            }
        }


        switch (CollectedMsg.content.toLowerCase()) {
            case 'add':
                collector.stop('add');
                break;
            case 'remove':
                collector.stop('remove');
                break;
            case 'view':
                collector.stop('view');
                break;
            case 'cancel':
                collector.stop('cancel');
                break;
            default:
                collector.stop('cancel');
        }
    });

    // COLLECTOR HAS BEEN ENDED
    collector.on('end', (collected, msg) => {

        if (BotMsg && BotMsg.channel.type != 'dm') {
            BotMsg.delete();
        }

        switch (msg) {
            case 'cancel':
                return Functions.Cancel(WDR, Functions, OriginalMsg, Member);
            case 'add':
                return Functions.Add(WDR, Functions, OriginalMsg, Member, AreaArray);
            case 'distance':
                return Functions.Distance(WDR, Functions, OriginalMsg, Member, AreaArray);
            case 'remove':
                return Functions.Remove(WDR, Functions, OriginalMsg, Member, AreaArray);
            case 'view':
                return Functions.View(WDR, Functions, OriginalMsg, Member, AreaArray);
            case 'end':
                return null;
            case 'time':
                if (source != 'complete') {
                    return Functions.TimedOut(WDR, Functions, OriginalMsg, Member);
                }
                return null;
            default:
                return null;
        }
    });

    // END
    return;
};
