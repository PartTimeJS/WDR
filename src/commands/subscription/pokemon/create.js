module.exports = (WDR, Functions, message, member, advanced) => {
    WDR.wdrDB.query(`
        SELECT
            *
        FROM
            wdr_pokemon_subs
        WHERE
            user_id = '${member.id}'
                AND
            guild_id = '${message.guild.id}'
        LIMIT 31
    ;`,
    async function (error, subs) {
        if (error) {
            WDR.Console.error(WDR, '[subs/poke/create.js] Error Fetching Subscriptions to Create Subscription.', [error]);
            return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                timeout: 10000
            }));
        } else if (subs.length >= 30) {
            let subscription_success = new WDR.DiscordJS.messageEmbed().setColor('00ff00')
                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                .setTitle('Maximum Subscriptions Reached!')
                .setDescription('You are at the maximum of 50 subscriptions. Please remove one before adding another.')
                .setFooter('You can type \'view\', \'presets\', \'remove\', or \'edit\'.');
            message.channel.send(subscription_success).then(BotMsg => {
                return Functions.OptionCollect(WDR, Functions, 'create', message, BotMsg, member);
            });
        } else {
            let create = {};
            create.pokemon = await Functions.DetailCollect(WDR, Functions, 'Name', member, message, null, 'Respond with \'All\' or the Pokémon Name and Form if it has one. Names are not case-sensitive.', create);
            if (create.pokemon === null) {
                return;
            } else if (create.pokemon.name) {
                create.name = create.pokemon.name;
                create.pokemon_id = create.pokemon.id;
                create.forms = create.pokemon.forms;
                create.form_ids = create.pokemon.form_ids;
            } else {
                create.name = 'All';
                create.pokemon_id = 0;
            }

            if (create.pokemon_id > 0 && create.forms.length > 1) {
                create.form = await Functions.DetailCollect(WDR, Functions, 'Form', member, message, null, 'Please respond with the displayed number of the form -OR- type \'All\'. Type \'Cancel\' to Stop.', create);
                if (create.form === null) {
                    return;
                }

            } else {
                create.form = 0;
            }

            if (advanced == true) {

                if (create.pokemon === 0) {
                    create.pokemon_type = await Functions.DetailCollect(WDR, Functions, 'Type', member, message, null, 'Please respond with \'All\' or the Pokemon Type.', create);
                    if (create.pokemon_type === null) {
                        return;
                    }

                    create.gen = await Functions.DetailCollect(WDR, Functions, 'Generation', member, message, null, 'Please respond with the Generation number -OR- type \'All\'. Type \'Cancel\' to Stop.', create);
                    if (create.gen === null) {
                        return;
                    }
                } else {

                    create.pokemon_type = 0;
                    create.gen = 0;
                }

                create.min_iv = await Functions.DetailCollect(WDR, Functions, 'Minimum IV', member, message, null, 'Please respond with a IV number between 0 and 100 -OR- type \'All\'. Type \'Cancel\' to Stop.', create);
                if (create.gen === null) {
                    return;
                }

                if (create.min_iv == 100) {
                    create.max_iv = 100;

                } else {
                    create.max_iv = await Functions.DetailCollect(WDR, Functions, 'Maximum IV', member, message, null, 'Please respond with a IV number between 0 and 100 -OR- type \'All\'. Type \'Cancel\' to Stop.', create);
                    if (create.max_iv === null) {
                        return;
                    }

                }

                create.min_lvl = await Functions.DetailCollect(WDR, Functions, 'Minimum Level', member, message, null, 'Please respond with a value between 1 and ' + WDR.Max_Pokemon_Level + ' or type \'All\'. Type \'Cancel\' to Stop.', create);
                if (create.min_lvl === null) {
                    return;
                }

                if (create.min_lvl == WDR.Max_Pokemon_Level) {
                    create.max_lvl = WDR.Max_Pokemon_Level;

                } else {

                    create.max_lvl = await Functions.DetailCollect(WDR, Functions, 'Maximum Level', member, message, null, 'Please respond with a value between 1 and ' + WDR.Max_Pokemon_Level + ' or type \'All\'. Type \'Cancel\' to Stop.', create);
                    if (create.max_lvl === null) {
                        return;
                    }
                }

                if (create.pokemon_id > 0) {

                    create.gender = await Functions.DetailCollect(WDR, Functions, 'Gender', member, message, null, 'Please respond with \'Male\' or \'Female\' or type \'All\'.', create);
                    if (create.gender === null) {
                        return;
                    }

                    create.size = await Functions.DetailCollect(WDR, Functions, 'Size', member, message, null, 'Please respond with \'big\', \'large\', \'normal\', \'small\', \'tiny\' or \'All\'.', create);
                    if (create.size === null) {
                        return;
                    }

                    if (create.size !== 0) {
                        create.size = create.size.toLowerCase();
                    }
                } else {
                    create.size = 0;
                    create.gender = 0;
                }
            } else {

                create.max_iv = 100;
                create.max_lvl = WDR.Max_Pokemon_Level;
                create.gender = 0;
                create.pokemon_type = 0;
                create.gen = 0;
                create.size = 0;

                create.min_iv = await Functions.DetailCollect(WDR, Functions, 'Minimum IV', member, message, null, 'Please respond with a IV number between 0 and 100 -OR- type \'All\'. Type \'Cancel\' to Stop.', create);
                if (create.min_iv === null) {
                    return;
                }

                create.min_lvl = await Functions.DetailCollect(WDR, Functions, 'Minimum Level', member, message, null, 'Please respond with a value between 0 and ' + WDR.Max_Pokemon_Level + ' or type \'All\'. Type \'Cancel\' to Stop.', create);
                if (create.min_lvl === null) {
                    return;
                }
            }

            create.geotype = await Functions.DetailCollect(WDR, Functions, 'Geofence', member, message, null, 'Please respond with \'Yes\' or \'No\'', create);
            if (create.geotype === null) {
                return;
            } else if (create.geotype == 'location') {
                create.areas = member.db.location.name;
            } else if (create.geotype == 'areas') {
                create.areas = member.db.areas;
            } else {
                create.areas = 'All';
            }

            create.confirm = await Functions.DetailCollect(WDR, Functions, 'Confirm-Add', member, message, null, 'Type \'Yes\' or \'No\'. Subscription will be saved.', create);
            if (create.confirm === false) {
                return Functions.Cancel(WDR, Functions, message, member);
            } else {

                let query = `
                        INSERT INTO
                            wdr_pokemon_subs (
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
                                pokemon_type,
                                form,
                                min_lvl,
                                max_lvl,
                                min_iv,
                                max_iv,
                                size,
                                gender,
                                generation
                            )
                        VALUES (
                            '${member.id}',
                            '${member.db.user_name}',
                            '${message.guild.id}',
                            '${member.db.guild_name}',
                            ${member.db.bot},
                            ${member.db.pokemon_status},
                            '${create.geotype}',
                            '${member.db.areas}',
                            '${JSON.stringify(member.db.location)}',
                            ${create.pokemon_id},
                            '${create.pokemon_type}',
                            ${create.form},
                            ${create.min_lvl},
                            ${create.max_lvl},
                            ${create.min_iv},
                            ${create.max_iv},
                            '${create.size}',
                            ${create.gender},
                            ${create.gen}
                        )
                    ;`;
                WDR.wdrDB.query(
                    query,
                    function (error) {
                        if (error) {
                            if (error.toString().indexOf('Duplicate entry') >= 0) {
                                let subscription_success = new WDR.DiscordJS.messageEmbed().setColor('00ff00')
                                    .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                                    .setTitle('Existing Subscription Found!')
                                    .setDescription('Nothing Has Been Saved.' + '\n' + +'\n' +
                                            'Use the view to see if your overall or pokemon status is Active if you are not receiving DMs.')
                                    .setFooter('You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
                                message.channel.send(subscription_success).then(BotMsg => {
                                    return Functions.OptionCollect(WDR, Functions, 'complete', message, BotMsg, member);
                                });
                            } else {
                                WDR.Console.error(WDR, '[subs/pokemon/begin.js] Error Inserting Subscription.', [query, error]);
                                return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                                    timeout: 10000
                                }));
                            }
                        } else {
                            let subscription_success = new WDR.DiscordJS.messageEmbed().setColor('00ff00')
                                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                                .setTitle(create.name + ' Subscription Complete!')
                                .setDescription('Saved to the subscription Database.')
                                .setFooter('You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
                            message.channel.send(subscription_success).then(BotMsg => {
                                return Functions.OptionCollect(WDR, Functions, 'complete', message, BotMsg, member);
                            });
                        }
                    }
                );
            }
        }
    }
    );
};