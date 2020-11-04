module.exports = (WDR, Functions, source, oMessage, bMessage, Member, gym_name_array, gym_detail_array, gym_collection) => {

    let BotMsg = bMessage;
    let OriginalMsg = oMessage;

    const filter = CollectedMsg => CollectedMsg.author.id == OriginalMsg.author.id;
    const collector = OriginalMsg.channel.createMessageCollector(filter, {
        time: 60000
    });

    collector.on('collect', CollectedMsg => {

        try {
            CollectedMsg.delete();
        // eslint-disable-next-line no-empty
        } catch (e) {

        }

        let input = CollectedMsg.content.split(' ')[0].toString().toLowerCase();

        let add_words = ['ad', 'add', 'create'],
            preset_words = ['preset', 'presets'],
            remove_words = ['remove', 'rm'],
            modify_words = ['change', 'modify', 'edit', 'eidt'],
            view_words = ['view', 'vw', 'veiw', 'viw', 'vew'],
            pause_words = ['puase', 'pasue', 'pasue', 'psaue', 'paus', 'pause'],
            resume_words = ['resum', 'rseume', 'reusme', 'resuem', 'resume'];

        switch (true) {
            case add_words.some(word => input.includes(word)):
                collector.stop('add');
                break;
            case preset_words.some(word => input.includes(word)):
                collector.stop('preset');
                break;
            case remove_words.some(word => input.includes(word)):
                collector.stop('remove');
                break;
            case modify_words.some(word => input.includes(word)):
                collector.stop('edit');
                break;
            case view_words.some(word => input.includes(word)):
                collector.stop('view');
                break;
            case pause_words.some(word => input.includes(word)):
                collector.stop('pause');
                break;
            case resume_words.some(word => input.includes(word)):
                collector.stop('resume');
                break;
        }
    });

    collector.on('end', (collected, arg) => {

        try {
            BotMsg.delete();
        // eslint-disable-next-line no-empty
        } catch (e) {

        }

        switch (arg) {
            case 'cancel':
                return Functions.Cancel(WDR, Functions, OriginalMsg, Member, gym_name_array, gym_detail_array, gym_collection);
            case 'add':
                return Functions.Create(WDR, Functions, OriginalMsg, Member, gym_name_array, gym_detail_array, gym_collection);
            case 'preset':
                return Functions.Preset(WDR, Functions, OriginalMsg, Member, gym_name_array, gym_detail_array, gym_collection);
            case 'remove':
                return Functions.Remove(WDR, Functions, OriginalMsg, Member, gym_name_array, gym_detail_array, gym_collection);
            case 'edit':
                return Functions.Modify(WDR, Functions, OriginalMsg, Member, gym_name_array, gym_detail_array, gym_collection);
            case 'view':
                return Functions.View(WDR, Functions, OriginalMsg, Member, gym_name_array, gym_detail_array, gym_collection);
            case 'resume':
            case 'pause':
                return Functions.Status(WDR, Functions, OriginalMsg, Member, arg);
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