module.exports = function(WDR, p) {
    // CREATE QUEST EMBED
    let quest_embed = new WDR.DiscordJS.MessageEmbed()
        .setColor(p.color)
        .setThumbnail(p.sprite)
        .setAuthor(p.name, p.url)
        .setTitle(p.reward)
        .setDescription('**' + p.task + '**' + '\n' +
            ' ' + '\n' +
            p.area + ' | Directions: ' + '\n' +
            p.google + ' | ' + p.apple + ' | ' + p.waze)
        .setImage(p.static_map)
        .setFooter('Expires: ' + p.time);

    return quest_embed;
};