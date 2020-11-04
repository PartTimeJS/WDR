//let Embed_Config = require('../../../configs/embeds/events.js');

module.exports = async (WDR, message) => {
    let json = await WDR.Fetch_JSON('https://raw.githubusercontent.com/ccev/pogoinfo/info/events/active.json');
    let event = {
        name: json.name,
        start: (json.start ? WDR.Moment(json.start, 'YYYY-MM-DD HH:mm').format('h:mma DD-MMM') : 'n/a'),
        end: (json.end ? WDR.Moment(json.end, 'YYYY-MM-DD HH:mm').format('h:mma D-MMM') : 'n/a'),
        bonuses:  '**Bonuses:**' + '\n' + json.details.bonuses.join('\n'),
        spawns: '**Spawns:**' + '\n',
        raids: '',
        quests: '**Quests:**' + '\n',
        eggs: ''
    };
    if(json.details.spawns.length > 0){
        for(let s = 0, slen = json.details.bonuses.length; s < slen; s++){
            event.bonuses += '　- ' + json.details.bonuses[s] + '\n';
        }
    }
    if(json.details.spawns.length > 0){
        for(let s = 0, slen = json.details.spawns.length; s < slen; s++){
            let id = json.details.spawns[s].split('_')[0];
            let form = json.details.spawns[s].split('_')[1];
            let pokemon = await WDR.Get_Locale.Pokemon(WDR, { 
                discord: message.discord,
                pokemon_id: parseInt(id), 
                form: parseInt(form )
            });
            event.spawns += '　- ' + pokemon.pokemon_name + ' ' + pokemon.form_name + '\n';
        }
    }
    for (var key in json.details.quests) {
        let task = key;
        let rewards = json.details.quests[key], reward = '';
        for(let rw = 0, rwlen = rewards.length; rw < rwlen; rw++){
            if(rewards[rw].includes('_')){
                let rw_id = rewards[rw].split('_')[0];
                let rw_form = rewards[rw].split('_')[1];
                let pokemon = await WDR.Get_Locale.Pokemon(WDR, { 
                    discord: message.discord,
                    pokemon_id: parseInt(rw_id), 
                    form: parseInt(rw_form)
                });
                reward += pokemon.pokemon_name + ' ' + pokemon.form_name + ' or ';
            } else {
                reward += rewards[rw] + ' or ';
            }
            reward = reward.slice(0,-4).replace(/\s\s+/g, ' ');
        }
        event.quests += '　- ' + task + ' for ' + reward + '\n';
    }
    // for (var rkey in json.details.raids) {
    //     WDR.Console.error(WDR,'[commands/public/event.js] Saw raids in the event json. Report this to the WDR Git repo as an Issue.', json.details.raids);
    // }
    // for (var ekey in json.details.eggs) {
    //     WDR.Console.error(WDR,'[commands/public/event.js] Saw eggs in the event json. Report this to the WDR Git repo as an Issue.', json.details.eggs);
    // }
    let embed = new WDR.DiscordJS.MessageEmbed()
        .setAuthor('Current Active PoGo Event:','https://pokemongolive.com/img/posts/nov2019-events.jpg')
        .setTitle(event.name)
        .setDescription('**Starts:**　`' + event.start + '`' + '\n' + '\n' + 
            '**Ends:**　`' + event.end + '`' + '\n' + '\n' + 
            event.bonuses + '\n' +
            event.spawns + '\n' +
            event.quests);
    WDR.Send_Embed(WDR, embed, message.channel.id).then(m => m.delete({
        timeout: 60000
    }));
};