/* eslint-disable no-async-promise-executor */
module.exports = (WDR, Functions, type, Member, Message, object, requirements, sub) => {
    return new Promise(async resolve => {
        let instruction;

        const filter = cMessage => cMessage.author.id == Message.author.id;
        const collector = Message.channel.createMessageCollector(filter, {
            time: 60000
        });

        switch (type) {


            case 'Guild':
                var list;
                object.forEach((guild, i) => {
                    list += (i + 1) + ' - ' + guild.name + '\n';
                });
                list = list.slice(0, -1);

                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('Choose a Discord:')
                    .setDescription(list)
                    .setFooter(requirements);
                break;


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
                    .setTitle('What Pokémon would you like to Subscribe to?')
                    .setFooter(requirements);
                if (object) {
                    instruction.setDescription('Current: `' + object + '`');
                }
                break;


            case 'Type':
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('What Pokémon Type would you like to Subscribe to?')
                    .setFooter(requirements);
                if (object) {
                    instruction.setDescription('Current: `' + WDR.Capitalize(object) + '`');
                }
                break;


            case 'Form':
                var forms = '**0 - All**\n';
                for (let f = 0, flen = sub.forms.length; f < flen; f++) {
                    forms += '**' + (f + 1) + ' - ' + sub.forms[f] + '**\n';
                }
                forms = forms.slice(0, -1);
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('What Form of ' + sub.name + ' would you like to Subscribe to?')
                    .setDescription(forms)
                    .setFooter(requirements);
                if (object) {
                    if (object.form === 0) {
                        instruction.setDescription('Current: `All Pokémon`' + '\n' +
                            'Available Forms:' + '\n　' + forms);
                    } else {
                        instruction.setDescription('Current: `' + WDR.Master.Pokemon[object.pokemon_id].forms[object.form].form + '`' + '\n' +
                            'Available Forms:' + '\n　' + forms);
                    }
                }
                break;


            case 'Confirm-Add':

                var gender;
                if (sub.gender == 1) {
                    gender = 'Male';
                } else if (sub.gender == 2) {
                    gender = 'Female';
                } else {
                    gender = 'All';
                }

                var size;
                if (sub.size === 0) {
                    size = 'All';
                } else {
                    size = await WDR.Capitalize(size);
                }

                var form;
                if (sub.form === 0) {
                    form = 'All';
                } else {
                    form = WDR.Master.Pokemon[sub.pokemon_id].forms[sub.form].form;
                }

                var gen;
                if (sub.gen === 0) {
                    gen = 'All';
                } else {
                    gen = sub.gen;
                }


                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('Does all of this look correct?')
                    .setDescription('Name: `' + sub.name + '`\n' +
                        'Form: `' + form + '`\n' +
                        'Min IV: `' + sub.min_iv + '`\n' +
                        'Max IV: `' + sub.max_iv + '`\n' +
                        'Min Lvl: `' + sub.min_lvl + '`\n' +
                        'Max Lvl: `' + sub.max_lvl + '`\n' +
                        'Gender: `' + gender + '`\n' +
                        'Size: `' + size + '`\n' +
                        'Generation: `' + gen + '`\n' +
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
                    .setTitle('Which Subscription do you want to remove?')
                    .setDescription(sub)
                    .setFooter(requirements);
                break;


            case 'Modify':
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('Which Subscription do you want to Modify?')
                    .setDescription(sub)
                    .setFooter(requirements);
                break;


            case 'Geofence':
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('Do you want to get notifications for ' + sub.name + ' filtered by your set Areas/Location?')
                    .setDescription('**Yes** - Your notifications for this Pokémon will be filtered based on your set areas/location.\n' +
                        '**No** - You will get notifications for this pokemon in the entire city scan area.')
                    .setFooter(requirements);
                break;


            default:
                instruction = new WDR.DiscordJS.MessageEmbed()
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle('What **' + type + '** would like you like to set for **' + sub.name + '** Notifications?')
                    .setFooter(requirements);
                if (object) {
                    instruction.setDescription('Current: `' + object + '`');
                }
        }

        Message.channel.send(instruction).then(msg => {

            collector.on('collect', async CollectedMsg => {

                try {
                    CollectedMsg.delete();
                // eslint-disable-next-line no-empty
                } catch (e) {

                }

                switch (true) {


                    case CollectedMsg.content.toLowerCase() == 'stop':
                    case CollectedMsg.content.toLowerCase() == 'cancel':
                        collector.stop('cancel');
                        break;


                    case type.includes('Confirm-Add'):
                    case type.includes('Confirm-Remove'):
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


                    case type.includes('Geofence'):
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


                    case type.includes('Guild'):
                    case type.includes('Preset'):
                    case type.includes('Modify'):
                    case type.includes('Remove'):
                        var num = parseInt(CollectedMsg.content);
                        switch (true) {
                            case (isNaN(CollectedMsg.content)):
                                return CollectedMsg.reply('`' + CollectedMsg.content + '` is not a Number. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                            case (num > 0 && num <= object.length):
                                return collector.stop((num - 1));
                            default:
                                return CollectedMsg.reply('`' + CollectedMsg.content + '` is not a valid # selection. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                        }


                    case type.includes('Name'):
                        switch (true) {
                            case (CollectedMsg.content.toLowerCase() == 'same'):
                            case (CollectedMsg.content.toLowerCase() == 'keep'):
                            case (CollectedMsg.content.toLowerCase() == 'next'):
                                collector.stop(object);
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'all'):
                                collector.stop(0);
                                break;
                            default:
                                var valid = await WDR.Pokemon_ID_Search(WDR, CollectedMsg.content.split(' ')[0]);
                                if (valid) {
                                    return collector.stop(valid);
                                } else {
                                    return CollectedMsg.reply('`' + CollectedMsg.content + '` doesn\'t appear to be a valid Pokémon name. Please check the spelling and try again.').then(m => m.delete({
                                        timeout: 5000
                                    }));
                                }
                        }
                        break;


                    case type.includes('Type'):
                        switch (true) {
                            case (CollectedMsg.content.toLowerCase() == 'same'):
                            case (CollectedMsg.content.toLowerCase() == 'keep'):
                            case (CollectedMsg.content.toLowerCase() == 'next'):
                                collector.stop(object);
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'all'):
                                collector.stop(0);
                                break;
                            default:
                                var match;
                                WDR.Master.Pokemon_Types.forEach(type => {
                                    if (type.toLowerCase() == CollectedMsg.content.toLowerCase()) {
                                        match = type.toLowerCase();
                                        collector.stop(match);
                                    }
                                });
                                if (!match) {
                                    return CollectedMsg.reply('`' + CollectedMsg.content + '` doesn\'t appear to be a valid type. Please check the spelling and try again.').then(m => m.delete({
                                        timeout: 5000
                                    }));
                                }
                        }
                        break;


                    case type.includes('Form'):
                        switch (true) {
                            case (CollectedMsg.content.toLowerCase() == 'same'):
                            case (CollectedMsg.content.toLowerCase() == 'keep'):
                            case (CollectedMsg.content.toLowerCase() == 'next'):
                                collector.stop(object.form);
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'all' || CollectedMsg.content === '0'):
                                collector.stop(0);
                                break;
                            case (parseInt(CollectedMsg.content) >= 0 && parseInt(CollectedMsg.content) <= sub.forms.length):
                                collector.stop(sub.form_ids[sub.forms.indexOf(sub.forms[CollectedMsg.content - 1])]);
                                break;
                            default:
                                return CollectedMsg.reply('`' + CollectedMsg.content + '` is not a valid # selection. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                        }
                        break;


                    case type.includes('Generation'):
                        switch (true) {
                            case (CollectedMsg.content.toLowerCase() == 'same'):
                            case (CollectedMsg.content.toLowerCase() == 'keep'):
                            case (CollectedMsg.content.toLowerCase() == 'next'):
                                collector.stop(object);
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'all'):
                                collector.stop(0);
                                break;
                            case (!isNaN(CollectedMsg.content) && CollectedMsg.content > 0):
                                collector.stop(parseInt(CollectedMsg.content));
                                break;
                            default:
                                return CollectedMsg.reply('`' + CollectedMsg.content + '` doesn\'t appear to be a valid Generation number.').then(m => m.delete({
                                    timeout: 5000
                                }));
                        }
                        break;

                    case type.includes('IV'):
                        CollectedMsg.content = CollectedMsg.content.replace('%', '');
                        switch (true) {
                            case (CollectedMsg.content.toLowerCase() == 'same'):
                            case (CollectedMsg.content.toLowerCase() == 'keep'):
                            case (CollectedMsg.content.toLowerCase() == 'next'):
                                collector.stop(object);
                                break;
                            case (CollectedMsg.content.includes('/')):
                                CollectedMsg.reply('`' + CollectedMsg.content + '` is an Invalid Input. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                })); break;
                            case (parseInt(CollectedMsg.content) >= 0 && parseInt(CollectedMsg.content) <= 100):
                                collector.stop(parseInt(CollectedMsg.content));
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'all'):
                                if (type.includes('Minimum')) {
                                    collector.stop(0);
                                } else {
                                    collector.stop(100);
                                }
                                break;
                            default:
                                CollectedMsg.reply('`' + CollectedMsg.content + '` is an Invalid Input. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                        }
                        break;

                    case type.includes('Level'):
                        switch (true) {
                            case (CollectedMsg.content.toLowerCase() == 'same'):
                            case (CollectedMsg.content.toLowerCase() == 'keep'):
                            case (CollectedMsg.content.toLowerCase() == 'next'):
                                collector.stop(object);
                                break;
                            case (parseInt(CollectedMsg.content) > 0 && parseInt(CollectedMsg.content) <= WDR.Max_Pokemon_Level):
                                collector.stop(parseInt(CollectedMsg.content));
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'all'):
                                if (type.includes('Minimum')) {
                                    collector.stop(1);
                                } else {
                                    collector.stop(WDR.Max_Pokemon_Level);
                                }
                                break;
                            default:
                                CollectedMsg.reply('`' + CollectedMsg.content + '` is an Invalid Input. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                        }
                        break;

                    case type.includes('Gender'):
                        switch (true) {
                            case (CollectedMsg.content.toLowerCase() == 'same'):
                            case (CollectedMsg.content.toLowerCase() == 'keep'):
                            case (CollectedMsg.content.toLowerCase() == 'next'):
                                collector.stop(object);
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'male'):
                                collector.stop(1);
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'female'):
                                collector.stop(2);
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'all'):
                                collector.stop(0);
                                break;
                            default:
                                CollectedMsg.reply('`' + CollectedMsg.content + '` is an Invalid Input. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                        }
                        break;

                    case type.includes('Size'):
                        switch (true) {
                            case (CollectedMsg.content.toLowerCase() == 'same'):
                            case (CollectedMsg.content.toLowerCase() == 'keep'):
                            case (CollectedMsg.content.toLowerCase() == 'next'):
                                collector.stop(object);
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'big'):
                                collector.stop('big');
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'large'):
                                collector.stop('large');
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'normal'):
                                collector.stop('normal');
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'small'):
                                collector.stop('small');
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'tiny'):
                                collector.stop('tiny');
                                break;
                            case (CollectedMsg.content.toLowerCase() == 'all'):
                                collector.stop(0);
                                break;
                            default:
                                CollectedMsg.reply('`' + CollectedMsg.content + '` is an Invalid Input. ' + requirements).then(m => m.delete({
                                    timeout: 5000
                                }));
                        }
                        break;

                    default:
                        CollectedMsg.reply('`' + CollectedMsg.content + '` is an Invalid Input. Type cancel to quit. this subscription.' + requirements).then(m => m.delete({
                            timeout: 5000
                        }));
                }
            });

            collector.on('end', (collected, reason) => {

                if (reason == null) {
                    return;
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
                        Functions.Cancel(WDR, Functions, Message, Member, 'Pokemon');
                        return null;
                    case 'time':
                        Functions.TimedOut(WDR, Functions, Message, Member, 'Pokemon');
                        return null;
                    default:
                        return resolve(reason);
                }
            });
        });

        // END
        return;
    });
};