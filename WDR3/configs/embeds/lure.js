module.exports = function(WDR, p) {

  let lure_embed = new WDR.DiscordJS.MessageEmbed()
    .setColor(p.color)
    .setThumbnail(p.sprite)
    .setAuthor(p.name, p.url)
    .setTitle("**" + p.type + " Lure**")
    .setDescription(p.area + " | Directions: " + "\n" +
      p.google + " | " + p.apple + " | " + p.waze)
    .setImage(p.static_map)
    .setFooter("Lure Expires at: " + p.time + " (" + p.mins + " Mins) ");

  return lure_embed;
}

// White space used in the default embed => " "
//(Copy between the quotes. It"s not a normal space even though it looks like one.)

// Other spaces:
// https://www.brunildo.org/test/space-chars.html

//------------------------------------------------------------------------------
//  AVAILABLE VARIABLES
//------------------------------------------------------------------------------
//    p.color           -   Type Color (Hex)
//    p.sprite          -   Lure Sprite Image
//    p.name            -   Pokestop Name
//    p.url         -   URL for Pokestop image
//    p.area            -   Geofence Area of the Pokestop
//    p.google          -   Google Directions URL
//    p.apple           -   Apple Directions URL
//    p.waze            -   Waze Directions URL
//    p.pmsf            -   PMSF Map Link to the Sighting
//    p.rdm             -   RDM Map Link to the Sighting
//    p.static_map      -   Static Map Tile Image
//    p.time            -   Expire Time
//    p.mins            -   Expire Minutes