module.exports = (WDR, Functions, message, member) => {

    WDR.wdrDB.query(`
        SELECT
            *
        FROM
            wdr_quest_subs
        WHERE
            user_id = '${member.id}'
                AND
            guild_id = '${message.guild.id}'
     ;`,
    async function (error, subs) {
        if (error) {
            WDR.Console.error(WDR, '[cmd/sub/quest/create.js] Error Fetching Subscriptions to Create Subscription.', [error]);
            return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                timeout: 10000
            }));
        } else if (subs.length >= 20) {
            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                .setTitle('Maximum Subscriptions Reached!')
                .setDescription('You are at the maximum of 20 subscriptions. Please remove one before adding another.')
                .setFooter('You can type \'view\', \'presets\', \'remove\', or \'edit\'.');
            message.channel.send(subscription_success).then(BotMsg => {
                return Functions.OptionCollect(WDR, Functions, 'create', message, BotMsg, member);
            });
        } else {

            let create = {};

            create.reward = await Functions.DetailCollect(WDR, Functions, 'Name', member, message, null, 'Please type a reward. This can be a pokemon name or item.', create);
            if (create.reward === null) {
                return;
            } else if (create.reward.type === 'item') {
                create.reward = create.reward.item_name;
                create.quantity = await Functions.DetailCollect(WDR, Functions, 'Quantity', member, message, null, 'Respond with a specific quantity or type \'all\'.', create);
                if (create.quantity === null) {
                    return;
                } else if (create.quantity > 0) {
                    create.reward = create.quantity + ' ' + create.reward;
                }
            }

            create.geotype = await Functions.DetailCollect(WDR, Functions, 'Geofence', member, message, null, 'Please respond with \'Yes\' or \'No\'', create);
            if(create.geotype == null){
                return;
            } else if (create.geotype == 'location') {
                create.areas = member.db.location.name;
            } else if (create.geotype == 'areas') {
                create.areas = member.db.areas;
            } else {
                create.areas = 'All';
            }

            create.confirm = await Functions.DetailCollect(WDR, Functions, 'Confirm-Add', member, message, null, 'Type \'Yes\' or \'No\'. Subscription will be saved.', create);
            if (create.confirm === null) {
                return;
            } else if (create.confirm === false) {
                return Functions.Cancel(WDR, Functions, message, member);
            } else {

                let query = `
                    INSERT INTO
                        wdr_quest_subs (
                            user_id,
                            user_name,
                            guild_id,
                            guild_name,
                            bot,
                            status,
                            geotype,
                            areas,
                            location,
                            reward,
                            alert_time
                        )
                    VALUES (
                        '${member.id}',
                        '${member.db.user_name}',
                        '${message.guild.id}',
                        '${member.db.guild_name}',
                        ${member.db.bot},
                        ${member.db.quest_status},
                        '${create.geotype}',
                        '${member.db.areas}',
                        '${JSON.stringify(member.db.location)}',
                        '${create.reward}',
                        '${member.db.quest_time}'
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
                                    return Functions.OptionCollect(WDR, Functions, 'create', message, BotMsg, member);
                                });

                            } else {
                                WDR.Console.error(WDR, '[cmd/sub/quest/create.js] Error Inserting Subscription.', [query, error]);
                                return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                                    timeout: 10000
                                }));
                            }

                        } else {
                            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                                .setAuthor(member.db.user_name, member.user.displayAvatarURL())
                                .setTitle(create.reward + ' Quest Subscription Complete!')
                                .setDescription('Saved to the Database.')
                                .setFooter('You can type \'view\', \'presets\', \'add\', or \'remove\'.');
                            message.channel.send(subscription_success).then(msg => {
                                return Functions.OptionCollect(WDR, Functions, 'complete', message, msg, member);
                            });
                        }
                    }
                );
            }
        }
    }
    );
};