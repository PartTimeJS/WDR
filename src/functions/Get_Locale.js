module.exports = {

  // GET POKEMON INFORMATION
  async Pokemon(WDR, Locale) {
    return new Promise(async resolve => {

      let P_Locale = Locale;

      P_Locale.form_id = P_Locale.form;

      if (P_Locale.pokemon_id === 0) {
       return resolve(P_Locale);
      }

      if (!P_Locale.costume_id) {
        P_Locale.costume_id = P_Locale.costume;
      }
      
      // DETERMINE DISCORD LANGUAGE
      switch (P_Locale.discord.locale) {
        case undefined:
        case "en":

          if (P_Locale.weather_boost && P_Locale.weather_boost != "") {
            P_Locale.weather_boost += " ***Boosted***";
          }


          P_Locale.pokemon_name = WDR.Master.Pokemon[P_Locale.pokemon_id].name;


          if (P_Locale.evolution > 0) {
            P_Locale.pokemon_name = "Mega " + P_Locale.pokemon_name;
            if (P_Locale.evolution > 1) {
              P_Locale.pokemon_name = P_Locale.pokemon_name + " " + WDR.Master.Mega_Forms[P_Locale.evolution];
            }


          } else if (P_Locale.form_id) {
            if (!WDR.Master.Pokemon[P_Locale.pokemon_id].forms[P_Locale.form_id]) {
              WDR.Console.error(WDR, "[Get_P_Locale.js] No form found for Pokemon: " + WDR.Master.Pokemon[P_Locale.pokemon_id].name + " Form#: " + P_Locale.form_id);
             return resolve(P_Locale);
            }
            P_Locale.form_name = WDR.Master.Pokemon[P_Locale.pokemon_id].forms[P_Locale.form_id].form ? "[" + WDR.Master.Pokemon[P_Locale.pokemon_id].forms[P_Locale.form_id].form + "]" : "";
          } else {
            P_Locale.form_name = "";
          }


          if (P_Locale.display_pokemon_id != null) {
            P_Locale.pokemon_name += " (" + WDR.Master.Pokemon[P_Locale.display_pokemon_id].name + ")";
          }


          if (P_Locale.move_1) {
            if (!WDR.Master.Moves[P_Locale.move_1]) {
              return WDR.Console.error(WDR, "[Get_P_Locale.js] No Move found for " + P_Locale.move_1);
            }
            P_Locale.move_1_name = WDR.Master.Moves[P_Locale.move_1].name;
          }


          if (P_Locale.move_2) {
            if (!WDR.Master.Moves[P_Locale.move_2]) {
              return WDR.Console.error(WDR, "[Get_P_Locale.js] No Move found for " + P_Locale.move_2);
            }
            P_Locale.move_2_name = WDR.Master.Moves[P_Locale.move_2].name;
          }
          break;


        default:

          if (P_Locale.weather_boost != "") {
            if (!WDR.Locales[P_Locale.discord.locale]["Boosted"]) {
              WDR.Console.error(WDR, "[Get_P_Locale.js] No " + P_Locale.discord.locale + " Translation found for `Boosted`.");
            }
            P_Locale.weather_boost += WDR.Locales[P_Locale.discord.locale]["Boosted"] ? " ***" + WDR.Locales[P_Locale.discord.locale]["Boosted"] + "***" : " ***Boosted***";
          }

          let locale_pokemon_name = WDR.Locales[P_Locale.discord.locale][WDR.Master.Pokemon[P_Locale.pokemon_id].name];


          P_Locale.pokemon_name = locale_pokemon_name ? locale_pokemon_name : WDR.Master.Pokemon[P_Locale.pokemon_id].name;

          if (P_Locale.move_1) {
            let local_move_1_name = WDR.Locales[P_Locale.discord.locale][WDR.Master.Moves[P_Locale.move_1].name];
            if (!WDR.Locales[P_Locale.discord.locale][WDR.Master.Moves[P_Locale.move_1]]) {
              WDR.Console.error(WDR, "[Get_P_Locale.js] " + P_Locale.discord.locale + " Translation does not exist for Move # " + P_Locale.move_1);
            }
            P_Locale.move_1_name = local_move_1_name ? local_move_1_name : WDR.Master.Moves[P_Locale.move_1].name;
          }


          if (P_Locale.move_2) {
            let locale_move_2_name = WDR.Locales[P_Locale.discord.locale][WDR.Master.Moves[P_Locale.move_2].name];
            if (!WDR.Locales[P_Locale.discord.locale][WDR.Master.Moves[P_Locale.move_2]]) {
              WDR.Console.error(WDR, "[Get_P_Locale.js] " + P_Locale.discord.locale + " Translation does not exist for Move # " + P_Locale.move_2);
            }
            P_Locale.move_2_name = locale_move_2_name ? locale_move_2_name : WDR.Master.Moves[P_Locale.move_2].name;
          }

          if (P_Locale.form_id) {
            let locale_form = "[" + WDR.Locales[P_Locale.discord.locale][WDR.Master.Pokemon[P_Locale.pokemon_id].forms[P_Locale.form_id].name] + "] ";
            if (!WDR.Locales[P_Locale.discord.locale][WDR.Master.Pokemon[P_Locale.pokemon_id].forms[P_Locale.form_id].name]) {
              WDR.Console.error(WDR, "[Get_P_Locale.js] " + P_Locale.discord.locale + " Translation does not exist for form: " + WDR.Master.Pokemon[P_Locale.pokemon_id].forms[P_Locale.form_id].name);
            }
            P_Locale.form_name = locale_form ? "[" + locale_form + "]" : "";
          } else {
            P_Locale.form_name = "";
          }

          // IDENTIFY DITTO AND ALTER DISPLAY NAME
          if (P_Locale.display_pokemon_id != null) {
            let display_pokemon_name = WDR.Locales[P_Locale.discord.locale][WDR.Master.Pokemon[P_Locale.display_pokemon_id].name];
            display_pokemon_name = display_pokemon_name ? display_pokemon_name : WDR.Master.Pokemon[P_Locale.pokemon_id].name;
            P_Locale.pokemon_name += " (" + display_pokemon_name + ")";
          }
      }

      // END
     return resolve(P_Locale);
    });
  },


  async Quest(Quest) {
    return new Promise(async resolve => {
      WDR.Console.log(WDR, "[LOCALE]", Quest);
     return resolve(Quest);
    });
  },

  async Raid(Lure) {
    return new Promise(async resolve => {

    });
  },

  async Invasion(Lure) {
    return new Promise(async resolve => {

    });
  },

  async Lure(Lure) {
    return new Promise(async resolve => {

    });
  }
}