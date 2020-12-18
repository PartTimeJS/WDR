module.exports = async (WDR, Functions, message, member) => {

    WDR.wdrDB.query(`
        SELECT
            *
        FROM
            wdr_pvp_subs
        WHERE
            user_id = '${member.id}'
                AND
            guild_id = '${member.guild.id}'
        LIMIT 31
    ;`,
    async function (error, subs) {
        if (error) {
            WDR.Console.error(WDR, '[cmd/sub/pvp/create.js] Error Fetching Subscriptions to Create Subscription.', [error]);
            return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                timeout: 10000
            }));
        } else if (subs.length >= 30) {
            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                .setTitle('Maximum Subscriptions Reached!')
                .setDescription('You are at the maximum of 50 subscriptions. Please remove one before adding another.')
                .setFooter('You can type \'view\', \'presets\', \'remove\', or \'edit\'.');
            message.channel.send(subscription_success).then(BotMsg => {
                return Functions.OptionCollect(WDR, Functions, 'create', message, BotMsg, member);
            });
        } else {
            let create = {};
            create.pokemon = await Functions.DetailCollect(WDR, Functions, 'Name', member, message, null, 'Respond with \'All\' or the Pokémon name. Names are not case-sensitive.', create);
            if (create.pokemon.name) {
                create.name = create.pokemon.name;
                create.pokemon_id = create.pokemon.id;
                create.forms = create.pokemon.forms;
                create.form_ids = create.pokemon.form_ids;
            } else {
                create.name = 'All';
                create.pokemon_id = 0;
            }

            if (create.pokemon_id > 0) {
                create.form = await Functions.DetailCollect(WDR, Functions, 'Form', member, message, null, 'Please respond with a Form Name of the specified Pokemon -OR- type \'All\'. Type \'Cancel\' to Stop.', create);
                create.pokemon_type = 0;
                create.gen = 0;
            } else {
                create.form = 0;
                create.pokemon_type = await Functions.DetailCollect(WDR, Functions, 'Type', member, message, null, 'Please respond with \'All\' or the Pokemon Type.', create);
                if (create.pokemon_type === 0) {
                    create.gen = await Functions.DetailCollect(WDR, Functions, 'Generation', member, message, null, 'Please respond with the Generation number -OR- type \'All\'. Type \'Cancel\' to Stop.', create);
                } else {
                    create.gen = 0;
                }
            }

            create.league = await Functions.DetailCollect(WDR, Functions, 'League', member, message, null, 'Please respond with \'Great\', \'Ultra\'.', create);

            create.min_rank = await Functions.DetailCollect(WDR, Functions, 'Minimum Rank', member, message, null, 'Please respond with a value between 1 and 20. Type \'Cancel\' to Stop.', create);
            // create.min_lvl = await Functions.DetailCollect(WDR, Functions, "Minimum CP", member, message, create.name, "Please respond with a number greater than 0 or 'All'. Type 'Cancel' to Stop.", create);
            // if (create.min_lvl != 0 && create.min_lvl != 1) {
            //   create.min_cp = await Functions.DetailCollect(WDR, Functions, "Minimum CP", member, message, create.name, "Please respond with a number greater than 0 or 'All'. Type 'Cancel' to Stop.", create);
            // } else {
            //   create.min_cp = 0;
            // }

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
                        wdr_pvp_subs (
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
                            league,
                            min_rank,
                            generation
                        )
                    VALUES (
                        '${member.id}',
                        '${member.db.user_name}',
                        '${message.guild.id}',
                        '${member.db.guild_name}',
                        ${member.db.bot},
                        ${member.db.pvp_status},
                        '${create.geotype}',
                        '${member.db.areas}',
                        '${JSON.stringify(member.db.location)}',
                        ${create.pokemon_id},
                        '${create.pokemon_type}',
                        ${create.form},
                        '${create.league}',
                        ${create.min_rank},
                        ${create.gen}
                    );`;
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
                                    return Functions.OptionCollect(WDR, Functions, 'create', message, BotMsg, member);
                                });
                            } else {
                                WDR.Console.error(WDR, '[commands/pokemon.js] Error Inserting Subscription.', [query, error]);
                                return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                                    timeout: 10000
                                }));
                            }
                        } else {
                            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                                .setTitle(create.name + ' PvP Subscription Complete!')
                                .setDescription('Saved to the Database.')
                                .setFooter('You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
                            message.channel.send(subscription_success).then(msg => {
                                return Functions.OptionCollect(WDR, Functions, 'create', message, msg, member);
                            });
                        }
                    }
                );
            }
        }
    }
    );
};