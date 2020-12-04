module.exports = function(WDR, p) {

  /* AVAILABLE VARIABLES
    p.type : Type of the Grunt Invasion
    p.weaknesses
    p.resistances
    p.type
    p.color
    p.gender : This is blank if it is a leader
    p.time
    p.mins
    p.secs
    p.lat
    p.lon
    p.area
    p.map_url
    p.google
    p.apple
    p.waze
    p.pmsf
    p.rdm
    p.encounters
    p.battles
    p.first
    p.second
    p.third
  */

  let invasion_embed = new WDR.DiscordJS.MessageEmbed()
    .setColor(p.color)
    .setThumbnail(p.sprite)
    .setAuthor(p.name, p.url)
    .setTitle("**" + p.type + " Invasion**")
    .setDescription("Invasion Expires: " + p.time + " (" + p.mins + " Mins)" + "\n" +
      " " + "\n" +
      p.area + " | Directions: " + "\n" +
      p.google + " | " + p.apple + " | " + p.waze)
    .setImage(p.static_map);

  return invasion_embed;
}