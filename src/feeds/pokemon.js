module.exports = (WDR, Sighting) => {

  let S = Sighting;
  let Feed_Embed = require(__dirname + "/../embeds/pokemon.js");

  if (WDR.Pokemon_Channels.length < 1) {
    return;
  }

  // CHECK ALL FILTERS
  WDR.Pokemon_Channels.forEach(feed_channel => {

    // LOOK UP CHANNEL
    let Ch = WDR.Bot.channels.cache.get(feed_channel[0]);
    if (!Ch) {
      return console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [feeds/pokemon.js] The channel " + feed_channel[0] + " does not appear to exist.");
    }

    // FETCH CHANNEL GEOFENCE
    Ch.Geofences = feed_channel[1].geofences.split(",");
    if (!Ch.Geofences) {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pokemon.js] You do not have a Geofences set for " + feed_channel[1] + ".");
    }

    // FETCH CHANNEL FILTER
    Ch.Filter = WDR.Filters.get(feed_channel[1].filter);
    if (!Ch.Filter) {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pokemon.js] The filter defined for " + feed_channel[0] + " does not appear to exist.");
    }

    // CHECK CHANNEL FILTER TYPE
    if (Ch.Filter.Type != "pokemon") {
      return console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pokemon.js] The filter defined for " + feed_channel[0] + " does not appear to be a pokemon filter.");
    }

    // ADD ROLE ID IF IT EXISTS IN CHANNEL CONFIG
    if (feed_channel[1].roleid) {
      if (feed_channel[1].roleid == "here" || feed_channel[1].roleid == "everyone") {
        S.Role_ID = "@" + feed_channel[1].roleid;
      } else {
        S.Role_ID = "<@&" + feed_channel[1].roleid + ">";
      }
    }

    // CHECK FILTER GEOFENCES
    switch (true) {
      case (Ch.Geofences.indexOf(S.Area.Default) >= 0):
      case (Ch.Geofences.indexOf(S.Area.Main) >= 0):
      case (Ch.Geofences.indexOf(S.Area.Sub) >= 0):

        // FRESH FILTER CRITERIA
        let criteria = {};
        criteria.gender = (Ch.Filter.gender == undefined ? "all" : Ch.Filter.gender).toLowerCase();
        criteria.size = (Ch.Filter.size == undefined ? "all" : Ch.Filter.size).toLowerCase();
        criteria.min_iv = Ch.Filter.min_iv == undefined ? 0 : Ch.Filter.min_iv;
        criteria.max_iv = Ch.Filter.max_iv == undefined ? 100 : Ch.Filter.max_iv;
        criteria.min_level = Ch.Filter.min_level == undefined ? 0 : Ch.Filter.min_level;
        criteria.max_level = Ch.Filter.max_level == undefined ? 35 : Ch.Filter.max_level;

        switch (true) {

          // // POST WITHOUT IV FILTER
          // case Ch.Filter.Post_Without_IV:
          //   switch (true) {
          //
          //     // ONLY BREAK IF UIV IS DISABLED
          //     case (S.cp > 0 && WDR.Config.UIV == "DISABLED"):
          //       break;
          //
          //     case !Ch.Filter[S.pokemon_id]:
          //       console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pokemon.js] Missing filter data for " + WDR.Master.Pokemon[S.pokemon_id].name + " in configs/filters/" + feed_channel[1].filter);
          //       break;
          //
          //     case Ch.Filter[S.pokemon_id] == "False":
          //       break;
          //
          //     default:
          //       S.Embed = feed_channel[1].embed ? feed_channel[1].embed : "pokemon.js";
          //       Feed_Embed(WDR, null, Ch, S);
          //   }
          //   break;

          //  BREAK IF POKEMON IS UNDEFINED
          case !Ch.Filter[WDR.Master.Pokemon[S.pokemon_id].name]:
            console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pokemon.js] Missing filter data for " + WDR.Master.Pokemon[S.pokemon_id].name + " in configs/filters/" + feed_channel[1].filter);
            break;

            //  BREAK IF POKEMON IS DISABLED
          case Ch.Filter[WDR.Master.Pokemon[S.pokemon_id].name] == "False":
            break;

            // FILTER BY VALUES
          default:

            S.Embed = feed_channel[1].embed ? feed_channel[1].embed : "pokemon_iv.js";

            switch (true) {

              // CP FILTERS
              case criteria.min_cp > S.cp:
                break;
              case criteria.max_cp < S.cp:
                break;

                // LEVEL FILTERS
              case criteria.min_level > S.pokemon_level:
                break;
              case criteria.max_level < S.pokemon_level:
                break;

                // SIZE FILTER
              case (criteria.size != "all" && criteria.size != S.size):
                break;

              default:
                switch (true) {

                  // Interal Value Filter
                  case criteria.min_iv > S.internal_value:
                    break;
                  case criteria.max_iv < S.internal_value:
                    break;
                  default:

                    if (criteria.gender == "all" || criteria.gender == S.gender) {
                      Feed_Embed(WDR, null, Ch, S);
                    }
                }
            }
        }
        break;

      default:
        //console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [feeds/pokemon.js] Pokemon ignored due to area filter. Wanted: " + Ch.Geofences + ", Saw: " + S.Area.Default + ", " + S.Area.Main + ", " + S.Area.Sub + ".");
    }
  });

  // END
  return;
}