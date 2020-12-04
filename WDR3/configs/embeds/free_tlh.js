const Discord = require('discord.js');
module.exports = function(WDR, p) {

    let pokemon_embed = new Discord.MessageEmbed()
        .setColor(p.color)
        .setThumbnail(p.sprite)
        .setURL('https://tally.pokemap.org')
        .setTitle('**' + p.name + '' + p.form + '** ' + p.atk + '/' + p.def + '/' + p.sta + ' (' + p.iv + '%) ' + p.area)
        .setDescription('Level ' + p.lvl + ' | CP ' + p.cp + p.gender_wemoji + '\n' +
        'Ht: ' + p.height + 'm | Wt: ' + p.weight + 'kg | ' + p.size + '\n' +
        p.move_1_name + ' ' + p.move_1_type + ' / ' + p.move_2_name + ' ' + p.move_2_type + '\n' +
        'Despawn: **' + p.time + ' (' + p.mins + 'm ' + p.secs + 's)** ' + p.verified + '\n' +
        p.weather_boost + ' \n' +
        '[https://tally.pokemap.org/' + p.name + '](https://tally.pokemap.org)');

    return pokemon_embed;
};