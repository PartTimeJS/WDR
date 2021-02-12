module.exports = (WDR, Functions, type, Member, Message, object, requirements, sub) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {

        let instruction = '';

        const filter = cMessage => cMessage.author.id == Message.author.id;
        const collector = Message.channel.createMessageCollector(filter, {
            time: 60000
        });

        switch (type) {


            case 'Preset':
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('Choose a Preset Subscription:')
                    .setDescription(object)
                    .setFooter(requirements);
                break;


            case 'Name':
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('What would you like to Subscribe to?')
                    .setDescription('Options:' + '\n' +
                        '　1 - Type a pokemon name.' + '\n' +
                        '　2 - Type an item name (Quantity prompt will follow).')
                    .setFooter(requirements);
                break;


            case 'Confirm-Add':
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('Does all of this look correct?')
                    .setDescription('Reward: `' + sub.reward + '`\n' +
                        'Areas: `' + sub.areas + '`')
                    .setFooter(requirements);
                break;


            case 'Confirm-Remove':
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('Are you sure you want to Remove ALL of your subscriptions?')
                    .setFooter(requirements);
                break;


            case 'Remove':
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('Which Quest Subscription do you want to remove?')
                    .setDescription(object)
                    .setFooter(requirements);
                break;


            case 'Geofence':
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('Do you want to get notifications for ' + sub.reward + ' filtered by your set Areas/Location?')
                    .setDescription('**Yes** - Your notifications for this Pokémon will be filtered based on your set areas/location.\n' +
                        '**No** - You will get notifications for this pokemon in the entire city scan area.')
                    .setFooter(requirements);
                break;


            default:
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('What **' + type + '** would you like to set for **' + sub.reward + '** Notifications?')
                    .setFooter(requirements);
        }

        Message.channel.send(instruction).catch(console.error).then(msg => {

            collector.on('collect', async CollectedMsg => {

                if (!CollectedMsg.content.startsWith(WDR.Config.PREFIX)) {
                    try {
                        CollectedMsg.delete();
                    // eslint-disable-next-line no-empty
                    } catch (e) {

                    }
                }

                switch (true) {

                    case CollectedMsg.content.startsWith(WDR.Config.PREFIX):
                    case CollectedMsg.content.toLowerCase() == 'stop':
                    case CollectedMsg.content.toLowerCase() == 'cancel':
                        collector.stop('cancel');
                        break;


                    case type.indexOf('Geofence') >= 0:
                        switch (CollectedMsg.content.toLowerCase()) {
                            case (CollectedMsg.content.toLowerCase() == 'same'):
                            case (CollectedMsg.content.toLowerCase() == 'keep'):
                            case (CollectedMsg.content.toLowerCase() == 'next'):
                                collector.stop(object);
                                break;
                            case 'yes':
                                collector.stop(Member.db.geotype);
                                break;
                            case 'all':
                            case 'no':
                                collector.stop('city');
                                break;
                            default:
                                CollectedMsg.reply('`' + CollectedMsg.content + '` is an Invalid Input. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                        }
                        break;


                    case type.indexOf('Confirm-Add') >= 0:
                    case type.indexOf('Confirm-Remove') >= 0:
                        switch (CollectedMsg.content.toLowerCase()) {
                            case 'save':
                            case 'yes':
                                collector.stop(true);
                                break;
                            case 'no':
                            case 'cancel':
                                collector.stop(false);
                                break;
                            default:
                                CollectedMsg.reply('`' + CollectedMsg.content + '` is an Invalid Input. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                        }
                        break;


                    case type.indexOf('Name') >= 0:
                        var valid = await WDR.Pokemon_ID_Search(WDR, CollectedMsg.content.split(' ')[0]);
                        if (valid) {
                            collector.stop(valid.name);
                        } else {
                            switch(true){
                                case CollectedMsg.content.toLowerCase() == 'stardust':
                                    valid = {
                                        type: 'item',
                                        item_name: await WDR.Capitalize(CollectedMsg.content)
                                    };
                                    break;
                                default:
                                    var item_array = Object.keys(WDR.Master.Items).map(i => WDR.Master.Items[i].name);
                                    for (let i = 0, ilen = item_array.length; i < ilen; i++) {
                                        if (item_array[i] && item_array[i].toLowerCase() === CollectedMsg.content.toLowerCase()) {
                                            valid = {
                                                type: 'item',
                                                item_name: await WDR.Capitalize(CollectedMsg.content)
                                            };
                                        }
                                    }
                            }
                            
                            if (valid) {
                                collector.stop(valid);
                            } else {
                                CollectedMsg.reply('`' + CollectedMsg.content + '` doesn\'t appear to be a valid Pokémon nor Item name. Please check the spelling and try again.').then(m => m.delete({
                                    timeout: 5000
                                }));
                            }
                        }
                        break;


                    case type.indexOf('Quantity') >= 0:
                        if (parseInt(CollectedMsg.content) > 0 && parseInt(CollectedMsg.content) < 5000) {
                            collector.stop(parseInt(CollectedMsg.content));
                        } else if (CollectedMsg.content.toLowerCase() === 'all'){
                            collector.stop(0);
                        } else {
                            CollectedMsg.reply('`' + CollectedMsg.content + '` is an Invalid Input. ' + requirements).then(m => m.delete({
                                timeout: 5000
                            }));
                        }
                        break;


                    case type.indexOf('Guild') >= 0:
                    case type.indexOf('Preset') >= 0:
                    case type.indexOf('Modify') >= 0:
                    case type.indexOf('Remove') >= 0:
                        var num = parseInt(CollectedMsg.content);
                        switch (true) {
                            case (isNaN(CollectedMsg.content)):
                                CollectedMsg.reply('`' + CollectedMsg.content + '` is not a Number. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                                break;
                            case (num > 0 && num <= object.length):
                                return collector.stop((num - 1));
                            default:
                                CollectedMsg.reply('`' + CollectedMsg.content + '` is not a valid # selection. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                        }
                        break;

                }
            });


            collector.on('end', (collected, reason) => {
                if (reason == null || reason == 'time') {
                    return resolve(false);
                }
                if (msg && msg.channel.type != 'dm') {
                    try {
                        msg.delete();
                    // eslint-disable-next-line no-empty
                    } catch (e) {

                    }
                }
                switch (reason) {
                    case 'cancel':
                        Functions.Cancel(WDR, Functions, Message, Member, 'Quest');
                        return null;
                    case 'time':
                        Functions.TimedOut(WDR, Functions, Message, Member, 'Quest');
                        return null;
                    default:
                        return resolve(reason);
                }
            });
        });
    });
};
