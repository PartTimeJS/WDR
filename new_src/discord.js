/* eslint-disable no-async-promise-executor */
'use strict';

const ini = require('ini');
const fs = require('fs-extra');
const discord = require('discord.js');

const Config = ini.parse(fs.readFileSync(__dirname + '/../configs/config.ini', 'utf-8'));
const Message = require('./message.js');
const Console = require('./utilities/console.js');
const Time = require('./utilities/time.js');
const Emojis = require(WDR.Dir + '/src/emojis.js');



const clientOptions = {
    disabledEvents: ['PRESENCE_UPDATE', 'VOICE_STATE_UPDATE', 'TYPING_START', 'VOICE_SERVER_UPDATE'],
    messageCacheMaxSize: 5,
    messageCacheLifetime: 120,
    messageSweepInterval: 60
};
const client = new discord.Client({
    fetchAllMembers: true
});
const ALPHA = new discord.Client(clientOptions);
const BRAVO = new discord.Client(clientOptions);
const CHARLIE = new discord.Client(clientOptions);
const DELTA = new discord.Client(clientOptions);
const ECHO = new discord.Client(clientOptions);

var emotes, next_client = 0, errors = 0, configs = [];

function loadConfigs(){
    return new Promise(async resolve => {
        await WDR.Fs.readdir(__dirname + '/../configs/discords', (err, discords) => {
            let discord_files = discords.filter(f => f.split('.').pop() === 'json');
            discord_files.forEach((f) => {
                delete require.cache[require.resolve(__dirname + '/../configs/discords/' + f)];
                let discord = require(__dirname + '/../configs/discords/' + f);
                configs.push(discord);
            });
            Console.info('[load_discords.js] Loaded ' + configs.length + ' Discord Config files.');
        });
    });
}

function arrayLogin() {
    return new Promise(async resolve => {
        client.array = [];
        let clients_available = [ALPHA, BRAVO, CHARLIE, DELTA, ECHO];
        await Config.TOKENS.BOT_TOKENS.forEach(async (token, i) => {
            if (token != 'TOKEN') {
                client.array.push(clients_available[i]);
                clients_available[i].on('ready', () => {
                    if (Config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
                        clients_available[i].user.setStatus('invisible');
                    }
                });
                clients_available[i].on('error', (error) => {
                    Console.error('[src/bot.js] Discord client encountered an error:', [error]);
                });
                await clients_available[i].login(token);
            }
        });
    });
}

function load() {
    return new Promise(async resolve => {
        Console.info('[src/bot.js] Loading Discord Configs...');
        await loadConfigs();
        Console.info('[src/bot.js] Logging in Main bot...');
        await client.login(Config.TOKENS.WDR);
        client.on('message', message => {
            Message.Parse(client, message);
        });
        client.on('ready', () => {
            emotes = new Emojis.DiscordEmojis();
            emotes.Load(WDR.Bot, WDR.Config.EMOJI_SERVERS.split(','));
            let logText = WDR.Snarkiness.initialized[randomNumber];
            WDR.Console.log(WDR, '[wdr.js] ' + logText);
        });
        Console.info('[src/bot.js] Logging in Worker bots...');
        await arrayLogin();
        client.next_client = 0;
    });
}

class DiscordClient {

    constructor() {
        this.servers = configs;
        this.emotes = emotes;
    }

    SendDirectMsg(user_id, embed, number) {
        if (number) {
            client.array[number].users.fetch(user_id).then(TARGET => {
                return TARGET.send(embed).catch(error => {
                    console.log(error);
                    if (error.code == 'ECONNRESET') {
                        Console.error('[src/discord.js] [' + Time() + '] [' + user_id + '] Error Code ', error.code);
                    } else {
                        Console.error('[src/discord.js] [' + Time() + '] [' + user_id + '] [' + client.array[number].id + '] ', error);
                    }
                });
            });
        } else {
            client.users.fetch(user_id).then(TARGET => {
                return TARGET.send(embed).catch(error => {
                    console.log(error);
                    if (error.code == 'ECONNRESET') {
                        Console.error('[src/discord.js] [' + Time() + '] [' + user_id + '] Error Code ', error.code);
                    } else {
                        Console.error('[src/discord.js] [' + Time() + '] [' + user_id + '] [' + client.array[number].id + '] ', error);
                    }
                });
            });
        }
        // END
        return;
    }

    SendChannelMsg(channel_id, embed) {
        if (next_client == (client.array.length - 1)) {
            next_client = 0;
        } else {
            next_client++;
        }
    
        let clientValid = client.array[next_client];
        if (!clientValid) {
            Console.error('[src/discord.js] No client found. next_client = ' + next_client + '. Client Array length: ' + client.array.length);
        }
    
        let channel = client.array[next_client].channels.cache.get(channel_id);
        if (!channel) {
            errors++;
            Console.error('[src/discord.js] Problem finding channel: ' + channel_id + ' using client: ' + client.array[next_client].user.id);
            if (errors >= 5) {
                Console.error('[src/discord.js] 5 Channel Errors Seen, Restarting WDR...');
                process.exit(1).catch(console.error);
            }
        }
        channel.send(embed).catch(error => {
            errors++;
            if (errors >= 5) {
                Console.error('[src/discord.js] 5 Channel Errors Seen, Restarting WDR...');
                process.exit(1).catch(console.error);
            }
            Console.error('[src/discord.js] ' + channel.id, error);
            console.error(embed);
        });

        // END
        return;
    }
};

module.exports = DiscordClient;
