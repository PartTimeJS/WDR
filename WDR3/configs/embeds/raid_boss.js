module.exports = function(WDR, g) {

  // ADD YOUR CUSTOM SPACING
  if (g.form != "") {
    g.form = " " + g.form;
  }
  if (g.sponsor != "") {
    g.sponsor = " | " + g.sponsor;
  }
  if (g.exraid != "") {
    g.exraid = " | " + g.exraid;
  }
  if (g.notes != "") {
    g.notes = "\n" + g.notes;
  }

  // CREATE THE RAID EMBED
  let raid_embed = new WDR.DiscordJS.MessageEmbed()
    .setColor(g.color)
    .setThumbnail(g.sprite)
    .setAuthor(g.gym, g.url)
    .setTitle("**" + g.boss + g.form + " Raid**")
    .setDescription(g.move_1_name + " " + g.move_1_type + " / " + g.move_2_name + " " + g.move_2_type + "\n" +
      "Raid Ends: **" + g.end_time + " (" + g.end_mins + " Mins)**" + "\n" +
      "Level " + g.lvl + " | " + g.team + g.sponsor + "\n" +
      "Counter(s): " + g.weaknesses + "\n" +
      g.exraid + g.notes + "\n" +
      "**" + g.area + "** | Directions:" + "\n" +
      g.google + " | " + g.apple + " | " + g.waze)
    .setImage(g.static_map);

  return raid_embed;
}

// White space used in the default embed => " "
//(Copy between the quotes. It"s not a normal space even though it looks like one.)

// Other spaces:
// https://www.brunildo.org/test/space-chars.html

//------------------------------------------------------------------------------
//  AVAILABLE VARIABLES
//------------------------------------------------------------------------------
//    g.form            -   Locale Boss Form
//    g.boss            -   Locale Gym Boss or "Egg"
//    g.move_1_name     -   Locale Move 1 Name
//    g.move_2_name     -   Locale Move 2 Name
//    g.lvl             -   Raid Level
//    g.sprite:         -   Egg / Boss Sprite
//    g.url             -   Gym Image URL
//    g.gym             -   Gym Name
//    g.exraid          -   If the Raid is an Exclusive Raid or Not
//    g.type            -   Boss Type
//    g.type_noemoji    -   Boss Type No Emojis
//    g.weaknesses:     -   Boss Type Weaknesses
//    g.resistances:    -   Boss Type Resistances
//    g.lat             -   GPS Latitude
//    g.lon             -   GPS Longitude
//    g.area            -   Geofence Area of the Sighting
//    g.google          -   Google Directions URL
//    g.apple           -   Apple Directions URL
//    g.waze            -   Waze Directions URL,
//    g.pmsf            -   PMF Map URL for Raid
//    g.rdm             -   RDM Map URL for Raid
//    g.team            -   Team Emoji and Name of Gym Control
//    g.color           -   Raid Level Color
//    g.hatch_time      -   Hatch Time
//    g.end_time        -   End Time
//    g.hatch_mins      -   Minutes until Hatch
//    g.end_mins        -   Minutes until End
//    g.move_1_type     -   Move 1 Type Emoji
//    g.move_2_type     -   Move 2 Type Emoji
//    g.minCP           -   Minimum CP for caught Raid Boss
//    g.maxCP           -   Maximum CP for caught Raid Boss (Perfect)
//    g.minCP_boosted   -   Minimum boosted CP for caught Raid Boss
//    g.maxCP_boosted   -   Maximum boosted CP for caught Raid Boss (Perfect)
//    g.static_map      -   Static Map URL