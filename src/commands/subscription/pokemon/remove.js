module.exports = (WDR, Functions, Message, Member) => {
    WDR.wdrDB.query(`
        SELECT
            *
        FROM
            wdr_pokemon_subs
        WHERE
            user_id = '${Member.id}'
                AND
            guild_id = '${Message.guild.id}'
    ;`,
    async function (error, subscriptions) {
        if (!subscriptions || !subscriptions[0]) {
            let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                .setTitle('You do not have any Pokémon Subscriptions!')
                .setFooter('You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
            Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
                return Functions.OptionCollect(WDR, Functions, 'view', Message, BotMsg, Member);
            });
        } else {
            let sub_list = '';
            for (let s = 0, slen = subscriptions.length; s < slen; s++) {
                let choice = s + 1;
                let sub_data = subscriptions[s];
                sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.pokemon_id] ? WDR.Master.Pokemon[sub_data.pokemon_id].name : 'All Pokémon';
                sub_list += '**' + choice + ' - ' + sub_data.pokemon_name + '**\n';
                let data = '';
                if (sub_data.form > 0) {
                    data += '　Form: `' + WDR.Master.Pokemon[sub_data.pokemon_id].forms[sub_data.form].form + '`\n';
                }
                if (sub_data.min_iv !== 0) {
                    data += '　Min IV: `' + sub_data.min_iv + '`\n';
                }
                if (sub_data.max_iv < 100) {
                    data += '　Max IV: `' + sub_data.max_iv + '`\n';
                }
                if (sub_data.min_lvl > 1) {
                    data += '　Min Lvl: `' + sub_data.min_lvl + '`\n';
                }
                if (sub_data.max_lvl < WDR.Max_Pokemon_Level) {
                    data += '　Max Lvl: `' + sub_data.max_lvl + '`\n';
                }
                if (sub_data.gender && sub_data.gender !== '0') {
                    let gender = await WDR.Get_Gender(sub_data.gender);
                    data += '　Gender: `' + gender + '`\n';
                }
                if (sub_data.size && sub_data.size !== '0') {
                    data += '　Size: `' + sub_data.size + '`\n';
                }
                if (sub_data.generation && sub_data.generation !== 0) {
                    data += '　Gen: `' + sub_data.generation + '`\n';
                }
                if (sub_data.geotype !== 'city') {
                    if (sub_data.geotype === 'location') {
                        data += '　' + 'Area: ' + '`' + JSON.parse(sub_data.location).name + '`';
                    } else {
                        data += '　' + 'Area: ' + '`' + sub_data.areas + '`' + '\n';
                    }
                } else if (data) {
                    data += '　' + 'Area: ' + '`All`' + '\n';
                }
                if (!data) {
                    data = '　`All' + '`\n';
                }
                sub_list += data + '\n';
            }
            sub_list = sub_list.slice(0, -1);

            let number = await Functions.DetailCollect(WDR, Functions, 'Remove', Member, Message, subscriptions, 'Type the corressponding # of the subscription you would like to remove -OR- type \'all\'', sub_list);

            let name, query;
            if (number == 'all') {
                name = 'All';
                query = `
                    DELETE FROM
                        wdr_pokemon_subs
                    WHERE
                        user_id = '${Member.id}'
                            AND 
                        guild_id = '${Message.guild.id}'
                    ;`;
            } else {
                let remove = subscriptions[number];
                if (WDR.Master.Pokemon[remove.pokemon_id]) {
                    name = WDR.Master.Pokemon[remove.pokemon_id].name;
                } else {
                    name = 'All ' + remove.min_iv + '+';
                    if (remove.min_lvl != 0 && remove.min_lvl != 1) {
                        name += ' Lvl' + remove.min_lvl + '-' + remove.max_lvl;
                    }
                    if (remove.gender != 0) {
                        let gender = await WDR.Get_Gender(remove.gender);
                        name += await WDR.Capitalize(gender);
                    }
                    if (remove.size != 0) {
                        name += ' ' + remove.size;
                    }
                    if (remove.generation != 0) {
                        name += ' Gen' + remove.generation;
                    }
                }

                query = `
                        DELETE FROM
                            wdr_pokemon_subs
                        WHERE
                            user_id = '${Member.id}'
                                AND 
                            pokemon_id = ${remove.pokemon_id}
                                AND 
                            form = ${remove.form}
                                AND 
                            min_lvl = ${remove.min_lvl}
                                AND 
                            max_lvl = ${remove.max_lvl}
                                AND 
                            min_iv = ${remove.min_iv}
                                AND 
                            max_iv = ${remove.max_iv}
                                AND 
                            size = '${remove.size}'
                                AND 
                            gender = ${remove.gender}
                                AND 
                            generation = ${remove.generation}
                    ;`;
            }
            WDR.wdrDB.query(
                query,
                async function (error) {
                    if (error) {
                        WDR.Console.error(WDR, '[commands/pokemon.js] Error Removing Subscription.', [query, error]);
                        return Message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                            timeout: 10000
                        }));
                    } else {
                        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                            .setTitle(name + ' Subscription(s) Removed!')
                            .setDescription('Saved to the subscription Database.')
                            .setFooter('You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
                        return Message.channel.send(subscription_success).then(BotMsg => {
                            return Functions.OptionCollect(WDR, Functions, 'complete', Message, BotMsg, Member);
                        });
                    }
                }
            );

        }
    });
};