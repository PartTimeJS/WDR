const Discord = require('discord.js');
module.exports = function(p) {

  let pokemon_embed = new Discord.MessageEmbed()
    .setColor(p.color)
    .setThumbnail(p.sprite)
    .setDescription('Subscribe at https://gvl.pokemap.org/')
    .addField('**'+p.name+'** '+p.form+p.attack+'/'+p.defense+'/'+p.stamina+' ('+p.iv+'%)\n'
             +'Level '+p.level+' | CP '+p.cp+p.gender, 'Ht: '+p.height+'m | Wt: '+p.weight+'kg | '+p.size+'\n'
             +p.move_name_1+' '+p.move_type_1+' / '+p.move_name_2+' '+p.move_type_2, false)
    .addField(p.verified+'| '+p.time+' (*'+p.mins+'m '+p.secs+'s*) ', p.type+p.weather_boost+'\n'
             +'**'+p.area+'**', false);

  return pokemon_embed;
}
