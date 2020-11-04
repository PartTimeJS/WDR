module.exports = (WDR, Message) => {

    Message.author.user_guilds = [];

    WDR.Discords.forEach(async (server) => {
        let guild = WDR.Bot.guilds.cache.get(server.id);
        if (!guild) {
            WDR.Console.error(WDR, '[handlers/commands.js] Guild ID `' + server.id + '` found in the database that does not match any guilds in the config.');
        } else {
            let member = WDR.Bot.guilds.cache.get(server.id).members.cache.get(Message.author.id);
            if (member && member.roles.cache.has(server.donor_role)) {
                Message.author.user_guilds.push({
                    id: guild.id,
                    name: server.name
                });
            }
        }
    });

    if (Message.author.user_guilds.length == 1) {
        WDR.wdrDB.query(`
            SELECT
                *
            FROM
                users
            WHERE
                user_id = ${Message.author.id}
                    AND 
                guild_id = ${Message.author.user_guilds[0]}
        ;`,
        async function(error, user) {
            if (!user || !user[0]) {
                return Message.reply('Before you can create and modify subscriptions via DM, you must first use the subsciption channel in your scanner discord.');
            } else {
                Message.author.db = user[0];
            }

            let command = Message.content.split(' ')[0].slice(1);
            switch (command) {
                case 'p':
                    command = 'pokemon';
                    break;
                case 'r':
                    command = 'raid';
                    break;
                case 'q':
                    command = 'quest';
                    break;
            }

            let Cmd = require(WDR.Dir + '/src/commands/subscription/' + command.toLowerCase() + '/begin.js');
            if (Cmd) {
                Cmd(WDR, Message);
            }
        }
        );
    } else if (Message.author.user_guilds.length > 1) {

        let list = '';
        Message.author.user_guilds.forEach((guild, i) => {
            list += (i + 1) + ' - ' + guild.name + '\n';
        });
        list = list.slice(0, -1);

        let request_action = new WDR.DiscordJS.MessageEmbed()
            .setAuthor(Message.author.username, Message.author.displayAvatarURL())
            .setTitle('Which Discord would you like to modify Subscriptions for?')
            .setDescription(list)
            .setFooter('Type the number of the discord.');

        Message.channel.send(request_action).catch(console.error).then(BotMsg => {

            const filter = CollectedMsg => CollectedMsg.author.id == Message.author.id;
            const collector = Message.channel.createMessageCollector(filter, {
                time: 60000
            });

            collector.on('collect', CollectedMsg => {

                let num = parseInt(CollectedMsg.content);

                switch (true) {
                    case (isNaN(CollectedMsg.content)):
                        return CollectedMsg.reply('`' + CollectedMsg.content + '` is not a Number. Type the number next to the Discord name above.').then(m => m.delete({
                            timeout: 5000
                        })).catch(console.error);
                    case (num > 0 && num <= list.length):
                        return collector.stop((num - 1));
                    default:
                        return CollectedMsg.reply('`' + CollectedMsg.content + '` is not a valid # selection. Type the number next to the Discord name above.').then(m => m.delete({
                            timeout: 5000
                        })).catch(console.error);
                }
            });

            collector.on('end', (collected, num) => {

                console.log(Message.author.user_guilds);
                console.log('num', Message.author.user_guilds[num]);

                BotMsg.delete();
                let query = `
                        SELECT
                            *
                        FROM
                            wdr_users
                        WHERE
                            user_id = ${Message.author.id}
                            AND guild_id = ${Message.author.user_guilds[num].id}
                    ;`;
                console.log(query);
                WDR.wdrDB.query(
                    query,
                    async function(error, user) {
                        if (error) {
                            WDR.Console.error(WDR, '[src/handlers/commands.js] DM: Error Fetching User From DB', [query, error]);
                        }
                        Message.author.db = user[0];

                        let command = Message.content.split(' ')[0].slice(1);
                        switch (command) {
                            case 'p':
                                command = 'pokemon';
                                break;
                            case 'r':
                                command = 'raid';
                                break;
                            case 'q':
                                command = 'quest';
                                break;
                        }

                        let Cmd = require(WDR.Dir + '/src/commands/subscription/' + command.toLowerCase() + '/begin.js');
                        if (Cmd) {
                            Cmd(WDR, Message);
                        }
                    }
                );
            });
        });
    } else {
        return Message.reply('I did not find any Discords in which you are a Donor. Please go to your discord\'s subscribe website before modifying subscriptions');
    }
};