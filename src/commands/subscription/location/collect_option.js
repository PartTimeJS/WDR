module.exports = (WDR, Functions, source, oMessage, bMessage, Member, AreaArray) => {
    let BotMsg = bMessage;
    let OriginalMsg = oMessage;

    const filter = CollectedMsg => CollectedMsg.author.id == OriginalMsg.author.id;
    const collector = OriginalMsg.channel.createMessageCollector(filter, {
        time: 60000
    });

    // FILTER COLLECT EVENT
    collector.on('collect', CollectedMsg => {

        if (!CollectedMsg.content.startsWith(WDR.Config.PREFIX)) {
            try {
                CollectedMsg.delete();
            // eslint-disable-next-line no-empty
            } catch (e) {

            }
        }

        switch (CollectedMsg.content.toLowerCase()) {
            case 'create':
                collector.stop('create');
                break;
            case 'remove':
                collector.stop('remove');
                break;
            case 'edit':
                collector.stop('edit');
                break;
            case 'set':
                collector.stop('set');
                break;
            case 'view':
                collector.stop('view');
                break;
            default:
                collector.stop('cancel');
        }
    });

    // COLLECTOR HAS BEEN ENDED
    collector.on('end', (_collected, msg) => {

        if (BotMsg && BotMsg.channel.type != 'dm') {
            try {
                BotMsg.delete();
            // eslint-disable-next-line no-empty
            } catch (e) {

            }
        }

        switch (msg) {
            case 'cancel':
                return Functions.Cancel(WDR, Functions, OriginalMsg, Member);
            case 'create':
                return Functions.Create(WDR, Functions, OriginalMsg, Member, AreaArray);
            case 'remove':
                return Functions.Remove(WDR, Functions, OriginalMsg, Member, AreaArray);
            case 'edit':
                return Functions.Modify(WDR, Functions, OriginalMsg, Member, AreaArray);
            case 'set':
                return Functions.Set(WDR, Functions, OriginalMsg, Member, AreaArray);
            case 'view':
                return Functions.View(WDR, Functions, OriginalMsg, Member, AreaArray);
            case 'end':
                return;
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
