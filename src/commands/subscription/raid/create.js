const Fuzzy = require('fuzzy');

module.exports = (WDR, Functions, message, member, gym_name_array, gym_detail_array, gym_collection) => {

    WDR.wdrDB.query(`
        SELECT
            *
        FROM
            wdr_raid_subs
        WHERE
            user_id = '${member.id}'
                AND
            guild_id = '${message.guild.id}'
        LIMIT 31
    ;`,
    async function (error, subs) {
        if (error) {
            WDR.Console.error(WDR, '[cmd/sub/raid/create.js] Error Fetching Subscriptions to Create Subscription.', [error]);
            return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                timeout: 10000
            }));
        } else if (subs.length >= 30) {
            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                .setTitle('Maximum Subscriptions Reached!')
                .setDescription('You are at the maximum of 20 subscriptions. Please remove one before adding another.')
                .setFooter('You can type \'view\', \'presets\', \'remove\', or \'edit\'.');
            message.channel.send(subscription_success).then(BotMsg => {
                return Functions.OptionCollect(WDR, Functions, 'create', message, BotMsg, member, gym_name_array, gym_detail_array, gym_collection);
            });
        } else {

            let create = {},
                got_name = false;

            do {
                create.gym = await Functions.DetailCollect(WDR, Functions, 'Gym', member, message, null, 'Respond with \'All\'  or a Gym Name. Names are not case-sensitive.', create, gym_name_array, gym_detail_array, gym_collection);
                if (create.gym === 0) {
                    create.name = 'All';
                    create.gym = 'All';
                    create.gym_id = 0;
                    got_name = true;

                } else if (create.gym.fuzzy) {
                    let results = Fuzzy.filter(create.gym.fuzzy, gym_name_array);

                    if (results.length === 1) {
                        let result_match = gym_collection.get(results[0].string);
                        create.gym_id = result_match.id;
                        create.gym = result_match.name;
                        create.name = result_match.name;
                        got_name = true;
                    } else {
                        //let matches = results.map(el => el.string);
                        let matches = results.map(function (el) {
                            return el.string;
                        });

                        if (matches.length < 1) {
                            message.reply('`' + create.gym.fuzzy + '`, does not closely match any gym in the database.').then(m => m.delete({
                                timeout: 8000
                            })).catch(console.error);

                        } else {
                            let user_choice = await Functions.MatchCollect(WDR, Functions, 'Matches', member, message, matches, 'Type the number of the Correct Gym.', create, gym_name_array, gym_detail_array, gym_collection);
                            console.log(user_choice);
                            let collection_match = gym_collection.get(matches[user_choice]);
                            if (collection_match) {
                                create.gym_id = collection_match.id;
                                create.gym = collection_match.name;
                                create.name = collection_match.name;
                                got_name = true;
                            }
                        }
                    }

                } else if (create.gym.length > 1) {
                    let user_choice = await Functions.MatchCollect(WDR, 'Multiple', member, message, null, 'Type the number of the Correct Gym.', create, gym_name_array, gym_detail_array, gym_collection);
                    create.gym_id = create.gym[user_choice].id;
                    create.gym = create.gym[user_choice].name;
                    create.name = create.gym[user_choice].name;
                    got_name = true;

                } else {
                    create.gym_id = create.gym[0].id;
                    create.gym = create.gym[0].name;
                    create.name = create.gym[0].name;
                    got_name = true;
                }
            } while (got_name == false);

            create.pokemon = await Functions.DetailCollect(WDR, Functions, 'Name', member, message, null, 'Respond with \'All\', \'Egg\' or the Raid Boss\'s name. Names are not case-sensitive.', create, gym_name_array, gym_detail_array, gym_collection);
            if (create.pokemon.name) {
                create.boss = create.pokemon.name;
                create.name += ' ' + create.pokemon.name;
                create.pokemon_id = create.pokemon.id;
                create.forms = create.pokemon.forms;
                create.form_ids = create.pokemon.form_ids;
            } else if (create.pokemon === -2) {
                create.name += ' Eggs';
                create.boss = 'Eggs';
                create.pokemon_id = -2;
            } else if (create.pokemon === -1) {
                create.name += ' Eggs & Bosses';
                create.boss = 'Eggs & Bosses';
                create.pokemon_id = 0;
            } else {
                create.name += ' Bosses';
                create.boss = 'Bosses';
                create.pokemon_id = 0;
            }

            if (create.pokemon_id === 0) {
                create.min_lvl = await Functions.DetailCollect(WDR, Functions, 'Minimum Level', member, message, null, 'Please respond with a value of 1 through ' + WDR.Max_Raid_Level + ' or type \'All\'. Type \'Cancel\' to Stop.', create, gym_name_array, gym_detail_array, gym_collection);

                if (create.min_lvl == WDR.Max_Raid_Level) {
                    create.max_lvl = WDR.Max_Raid_Level;
                } else {
                    create.max_lvl = await Functions.DetailCollect(WDR, Functions, 'Maximum Level', member, message, null, 'Please respond with a value of 1 through ' + WDR.Max_Raid_Level + ' or type \'All\'. Type \'Cancel\' to Stop.', create, gym_name_array, gym_detail_array, gym_collection);
                }

            } else {
                create.min_lvl = 1;
                create.max_lvl = WDR.Max_Raid_Level;
            }

            if (create.gym_id === 0) {
                create.geotype = await Functions.DetailCollect(WDR, Functions, 'Geofence', member, message, null, 'Please respond with \'Yes\' or \'No\'', create, gym_name_array, gym_detail_array, gym_collection);
                if(create.geotype == null){
                    return;
                } else if (create.geotype == 'location') {
                    create.areas = member.db.location.name;
                } else if (create.geotype == 'areas') {
                    create.areas = member.db.areas;
                } else {
                    create.areas = 'All';
                }
            } else {
                create.geotype = 'city';
                create.areas = 'All';
            }

            create.confirm = await Functions.DetailCollect(WDR, Functions, 'Confirm-Add', member, message, null, 'Type \'Yes\' or \'No\'. Subscription will be saved.', create, gym_name_array, gym_detail_array, gym_collection);
            if (create.confirm === false) {
                return Functions.Cancel(WDR, Functions, message, member);
            } else {

                create.gym = create.gym.replace('\'', '');

                let query = `
                    INSERT INTO
                        wdr_raid_subs (
                            user_id,
                            user_name,
                            guild_id,
                            guild_name,
                            bot,
                            status,
                            geotype,
                            areas,
                            location,
                            pokemon_id,
                            gym_id,
                            gym_name,
                            min_lvl,
                            max_lvl
                        )
                    VALUES (
                        '${member.id}',
                        '${member.db.user_name}',
                        '${message.guild.id}',
                        '${member.db.guild_name}',
                        ${member.db.bot},
                        ${member.db.raid_status},
                        '${create.geotype}',
                        '${member.db.areas}',
                        '${JSON.stringify(member.db.location)}',
                        ${create.pokemon_id},
                        '${create.gym_id}',
                        '${create.gym}',
                        ${create.min_lvl},
                        '${create.max_lvl}'
                    )
                ;`;
                WDR.wdrDB.query(
                    query,
                    async function (error) {
                        if (error) {
                            if (error.toString().indexOf('Duplicate entry') >= 0) {
                                let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('ff0000')
                                    .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                                    .setTitle('Existing Subscription Found!')
                                    .setDescription('Nothing has been saved.')
                                    .setFooter('You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
                                message.channel.send(subscription_success).then(BotMsg => {
                                    return Functions.OptionCollect(WDR, Functions, 'complete', message, BotMsg, member, gym_name_array, gym_detail_array, gym_collection);
                                });
                            } else {
                                WDR.Console.error(WDR, '[cmd/sub/raid/create.js] Error Inserting Subscription.', [query, error]);
                                return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                                    timeout: 10000
                                }));
                            }
                        } else {
                            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                                .setTitle(create.name + ' Raid Subscription Complete!')
                                .setDescription('Saved to the Database.')
                                .setFooter('You can type \'view\', \'presets\', \'add\', or \'remove\'.');
                            message.channel.send(subscription_success).then(msg => {
                                return Functions.OptionCollect(WDR, Functions, 'complete', message, msg, member, gym_name_array, gym_detail_array, gym_collection);
                            });
                        }
                    }
                );
            }
        }
    }
    );
};