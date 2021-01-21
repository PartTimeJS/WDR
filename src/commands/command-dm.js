module.exports = (WDR, message) => {

    message.author.user_guilds = [];

    WDR.Discords.forEach(async (server) => {
        let guild = WDR.Bot.guilds.cache.get(server.id);
        if (!guild) {
            WDR.Console.error(WDR, '[handlers/commands.js] Guild ID `' + server.id + '` found in the database that does not match any guilds in the config.');
        } else {
            let member = WDR.Bot.guilds.cache.get(server.id).members.cache.get(message.author.id);
            if (member && member.roles.cache.has(server.donor_role)) {
                message.author.user_guilds.push({
                    id: guild.id,
                    name: server.name
                });
            }
        }
    });

    if (message.author.user_guilds.length == 1) {
        WDR.wdrDB.query(`
            SELECT
                *
            FROM
                users
            WHERE
                user_id = ${message.author.id}
                    AND 
                guild_id = ${message.author.user_guilds[0]}
        ;`,
        async function(error, user) {
            
            if (!user || user.length == 0) {
                return message.reply('Before you can create and modify subscriptions via DM, you must first use the subsciption channel in your scanner discord.');
            } else {
                message.author.db = user[0];
            }

            let command = message.content.split(' ')[0].slice(1);

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
                case 'l':
                    command = 'location';
                    break;
                case 'a':
                    command = 'area';
                    break;
            }
    
            if (WDR.Fs.existsSync(WDR.Dir + '/src/commands/subscription/' + command.toLowerCase() + '/begin.js')) {
                let Cmd = require(WDR.Dir + '/src/commands/subscription/' + command.toLowerCase() + '/begin.js');
                if (Cmd) {
                    Cmd(WDR, message);
                }
            } else if (WDR.Fs.existsSync(WDR.Dir + '/src/commands/subscription/' + command.toLowerCase() + '.js')) {
                let Cmd = require(WDR.Dir + '/src/commands/subscription/' + command.toLowerCase() + '.js');
                if (Cmd) {
                    Cmd(WDR, message);
                }
            } else if (WDR.Fs.existsSync(WDR.Dir + '/src/commands/' + command.toLowerCase() + '.js')) {
                let Cmd = require(WDR.Dir + '/src/commands/' + command.toLowerCase() + '.js');
                if (Cmd) {
                    Cmd(WDR, message);
                }
            } else {
                WDR.Console.error(WDR, '[handlers/commands.js] ' + message.content + ' command does not exist.');
            }
        });
    } else if (message.author.user_guilds.length > 1) {

        let list = '';
        message.author.user_guilds.forEach((guild, i) => {
            list += (i + 1) + ' - ' + guild.name + '\n';
        });
        list = list.slice(0, -1);

        let request_action = new WDR.DiscordJS.MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTitle('Which Discord would you like to modify Subscriptions for?')
            .setDescription(list)
            .setFooter('Type the number of the discord.');

        message.channel.send(request_action).catch(console.error).then(BotMsg => {

            const filter = CollectedMsg => CollectedMsg.author.id == message.author.id;
            const collector = message.channel.createmessageCollector(filter, {
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

                console.log(message.author.user_guilds);
                console.log('num', message.author.user_guilds[num]);

                BotMsg.delete();
                let query = `
                        SELECT
                            *
                        FROM
                            wdr_users
                        WHERE
                            user_id = ${message.author.id}
                            AND guild_id = ${message.author.user_guilds[num].id}
                    ;`;
                console.log(query);
                WDR.wdrDB.query(
                    query,
                    async function(error, user) {
                        if (error) {
                            WDR.Console.error(WDR, '[src/handlers/commands.js] DM: Error Fetching User From DB', [query, error]);
                        }
                        message.author.db = user[0];

                        let command = message.content.split(' ')[0].slice(1);

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
                            case 'l':
                                command = 'location';
                                break;
                            case 'a':
                                command = 'area';
                                break;
                        }
                
                        //try {
                        if (WDR.Fs.existsSync(WDR.Dir + '/src/commands/subscription/' + command.toLowerCase() + '/begin.js')) {
                            let Cmd = require(WDR.Dir + '/src/commands/subscription/' + command.toLowerCase() + '/begin.js');
                            if (Cmd) {
                                Cmd(WDR, message);
                            }
                        } else if (WDR.Fs.existsSync(WDR.Dir + '/src/commands/subscription/' + command.toLowerCase() + '.js')) {
                            let Cmd = require(WDR.Dir + '/src/commands/subscription/' + command.toLowerCase() + '.js');
                            if (Cmd) {
                                Cmd(WDR, message);
                            }
                        } else if (WDR.Fs.existsSync(WDR.Dir + '/src/commands/' + command.toLowerCase() + '.js')) {
                            let Cmd = require(WDR.Dir + '/src/commands/' + command.toLowerCase() + '.js');
                            if (Cmd) {
                                Cmd(WDR, message);
                            }
                        } else {
                            WDR.Console.error(WDR, '[handlers/commands.js] ' + message.content + ' command does not exist.');
                        }
                    }
                );
            });
        });
    } else {
        return message.reply('I did not find any Discords in which you are a Donor. Please go to your discord\'s subscribe website before modifying subscriptions');
    }
};