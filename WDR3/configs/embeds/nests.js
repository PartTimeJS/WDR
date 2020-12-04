module.exports = function(WDR, p) {

  let nest_embed = new WDR.DiscordJS.MessageEmbed()
    .setColor(p.color)
    .setThumbnail(p.sprite)
    .addField("**" + p.name + "** " + p.form + " Nest\n" + p.type + "\nAvg Spawns: " + p.avg, "Submitted By: " + p.submitter)
    .addField(p.area + " | " + p.nest_name + ":", "[Google Maps](https://www.google.com/maps?q=" + p.lat + "," + p.lon + ") | " +
      "[Apple Maps](http://maps.apple.com/maps?daddr=" + p.lat + "," + p.lon + "&z=10&t=s&dirflg=d) | " +
      "[Scan Map](" + p.map_url + "?lat=" + p.lat + "&lon=" + p.lon + "&zoom=15)", false)
    .setImage(p.static_map)
    .setFooter("Nest Location Updated on: " + p.time);

  return nest_embed;
}