module.exports = {
  CalculatePossibleCPs,

  CalculateCP: function(WDR, pokemonID, formID, attack, defense, stamina, level) {
    let CP = 0;
    let pokemonAttack = 0,
      pokemonDefense = 0,
      pokemonStamina = 0;
    let CPMultiplier = WDR.cp_multiplier[level];

    if (!WDR.Master.Pokemon[pokemonID]) {
      return console.error('[WDR] [pvp.js] Can\'t find Pokemon ID: ' + pokemonID + ' Form:' + formID);
    }
    if (!WDR.Master.Pokemon[pokemonID].attack) {
      if (!WDR.Master.Pokemon[pokemonID].forms[formID] || !WDR.Master.Pokemon[pokemonID].forms[formID].attack) {
        return console.error('[WDR] [pvp.js] Can\'t find attack of Pokemon ID: ' + pokemonID + ' Form:' + formID);
      }
      pokemonAttack = WDR.Master.Pokemon[pokemonID].forms[formID].attack;
      pokemonDefense = WDR.Master.Pokemon[pokemonID].forms[formID].defense;
      pokemonStamina = WDR.Master.Pokemon[pokemonID].forms[formID].stamina;
    } else {
      pokemonAttack = WDR.Master.Pokemon[pokemonID].attack;
      pokemonDefense = WDR.Master.Pokemon[pokemonID].defense;
      pokemonStamina = WDR.Master.Pokemon[pokemonID].stamina;
    }

    let attackMultiplier = pokemonAttack + parseInt(attack);
    let defenseMultiplier = Math.pow(pokemonDefense + parseInt(defense), .5);
    let staminaMultiplier = Math.pow(pokemonStamina + parseInt(stamina), .5);
    CPMultiplier = Math.pow(CPMultiplier, 2);

    CP = (attackMultiplier * defenseMultiplier * staminaMultiplier * CPMultiplier) / 10;

    CP = Math.floor(CP);

    //CP floor is 10
    if (CP < 10) {
      CP = 10
    }

    return CP;
  },

  CalculateTopRanks: function(WDR, pokemonID, formID, cap) {
    let currentPokemon = this.InitializeBlankPokemon();
    let bestStat = {
      attack: 0,
      defense: 0,
      stamina: 0,
      value: 0
    };
    let arrayToSort = [];

    for (a = 0; a <= 15; a++) {
      for (d = 0; d <= 15; d++) {
        for (s = 0; s <= 15; s++) {
          let currentStat = this.CalculateBestPvPStat(WDR, pokemonID, formID, a, d, s, cap);

          if (currentStat > bestStat.value) {
            bestStat = {
              attack: a,
              defense: d,
              stamina: s,
              value: currentStat.value,
              level: currentStat.level
            };
          }

          currentPokemon[a][d][s] = {
            value: currentStat.value,
            level: currentStat.level
          }

          arrayToSort.push({
            attack: a,
            defense: d,
            stamina: s,
            value: currentStat.value
          });
        }
      }
    }

    arrayToSort.sort(function(a, b) {
      return b.value - a.value;
    });

    let best = arrayToSort[0].value;

    for (let i = 0; i < arrayToSort.length; i++) {
      let percent = this.PrecisionRound((arrayToSort[i].value / best) * 100, 2);
      arrayToSort[i].percent = percent;
      currentPokemon[arrayToSort[i].attack][arrayToSort[i].defense][arrayToSort[i].stamina].percent = percent;
      currentPokemon[arrayToSort[i].attack][arrayToSort[i].defense][arrayToSort[i].stamina].rank = i + 1;
    }

    return currentPokemon;
  },

  CalculateBestPvPStat: function(WDR, pokemonID, formID, attack, defense, stamina, cap) {
    let bestStat = 0;
    let level = 0;
    for (let i = 1; i <= 40; i += .5) {
      let CP = this.CalculateCP(WDR, pokemonID, formID, attack, defense, stamina, i);
      if (CP <= cap) {
        let stat = this.CalculatePvPStat(WDR, pokemonID, formID, i, attack, defense, stamina);
        if (stat > bestStat) {
          bestStat = stat;
          level = i;
        }
      } else if (CP > cap) {
        i = 41;
      }
    }

    return {
      value: bestStat,
      level: level
    };
  },

  CalculatePvPStat: function(WDR, pokemonID, formID, level, attack, defense, stamina) {

    if (!WDR.Master.Pokemon[pokemonID].attack) {
      attack = (attack + WDR.Master.Pokemon[pokemonID].forms[formID].attack) * WDR.cp_multiplier[level];
      defense = (defense + WDR.Master.Pokemon[pokemonID].forms[formID].defense) * WDR.cp_multiplier[level];
      stamina = (stamina + WDR.Master.Pokemon[pokemonID].forms[formID].stamina) * WDR.cp_multiplier[level];

    } else {
      attack = (attack + WDR.Master.Pokemon[pokemonID].attack) * WDR.cp_multiplier[level];
      defense = (defense + WDR.Master.Pokemon[pokemonID].defense) * WDR.cp_multiplier[level];
      stamina = (stamina + WDR.Master.Pokemon[pokemonID].stamina) * WDR.cp_multiplier[level];
    }

    product = attack * defense * Math.floor(stamina);

    product = Math.round(product);

    return product;
  },

  InitializeBlankPokemon: function() {
    let newPokemon = {};

    for (let a = 0; a <= 15; a++) {
      newPokemon[a] = {};

      for (let d = 0; d <= 15; d++) {
        newPokemon[a][d] = {};

        for (let s = 0; s <= 15; s++) {
          newPokemon[a][d][s] = {};
        }
      }
    }

    return newPokemon;
  },

  PrecisionRound: function(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  },

  FilterPossibleCPsByRank: function(possibleCPs, minRank = 4096) {
    let returnCPs = {};

    for (let pokemon in possibleCPs) {
      if (possibleCPs[pokemon].rank <= minRank) {
        returnCPs[pokemon] = possibleCPs[pokemon];
      }
    }
    return returnCPs;
  },

  FilterPossibleCPsByPercent: function(possibleCPs, minPercent = 0) {
    let returnCPs = {};

    for (let pokemon in possibleCPs) {
      if (possibleCPs[pokemon].percent >= minPercent) {
        returnCPs[pokemon] = possibleCPs[pokemon];
      }
    }
    return returnCPs;
  },

  SearchTopRank: function(WDR, search, filter) {
    // RUN CALCULATIONS
    let possible_cps = this.CalculatePossibleCPs(WDR, search.pokemon.pokemon_id, search.pokemon.form, search.stats.atk, search.stats.def, search.stats.sta, 1, 'Male', filter.min_cp_range, filter.max_cp_range);
    let unique_cps = {},
      ranks = {};

    for (let i = possible_cps.length - 1; i >= 0; i--) {
      if (!unique_cps[possible_cps[i].pokemonID]) {
        unique_cps[possible_cps[i].pokemonID] = {};
        pvpRanks = this.CalculateTopRanks(WDR, possible_cps[i].pokemonID, possible_cps[i].formID, filter.max_cp_range);
        ranks = pvpRanks[search.stats.atk][search.stats.def][search.stats.sta];
        for (a = 0; a <= 15; a++) {
          for (d = 0; d <= 15; d++) {
            for (s = 0; s <= 15; s++) {
              let ads = pvpRanks[a][d][s];
              if (ads.rank == '1' && this.CalculateCP(WDR, search.pokemon.pokemon_id, search.pokemon.form, a, d, s, ads.level) <= filter.max_cp_range) {
                ranks.topRank = pvpRanks[a][d][s];
                ranks.topRank.atk = a;
                ranks.topRank.def = d;
                ranks.topRank.sta = s;
              }
            }
          }
        }
      }
    }
    return ranks;
  }
}

async function CalculatePossibleCPs(WDR, pokemonID, formID, attack, defense, stamina, level, gender, league) {
  return new Promise(async resolve => {

    let possibleCPs = [];

    if (isNaN(attack) || isNaN(defense) || isNaN(stamina) || isNaN(level)) {
      return resolve(possibleCPs);
    }


    // Check for required gender on evolution
    if (!WDR.Master.Pokemon[pokemonID]) {
      return console.error("[WDR] [pvp.js] No Pokemon for ID " + pokemonID)
    }
    if (WDR.Master.Pokemon[pokemonID].gender_requirement && WDR.Master.Pokemon[pokemonID].gender_requirement != gender) {
      return resolve(possibleCPs);
    }

    let pokemonPvPValue = await QueryPvPRank(WDR, pokemonID, formID, attack, defense, stamina, level, league);
    if (pokemonPvPValue) {
      possibleCPs.push(pokemonPvPValue);
    }


    // IF no data about possible evolutions just return now rather than moving on
    if (!WDR.Master.Pokemon[pokemonID].evolutions) {
      return possibleCPs;
    }

    for (let i = 0; i < WDR.Master.Pokemon[pokemonID].evolutions.length; i++) {
      //Check for Evolution Form
      if (formID > 0) {
        if (!WDR.Master.Pokemon[pokemonID].forms[formID]) {
          evolvedForm = WDR.Master.Pokemon[WDR.Master.Pokemon[pokemonID].evolutions[i]].default_form_id;
        } else {
          evolvedForm = WDR.Master.Pokemon[pokemonID].forms[formID].evolution_form;
        }
      } else if (WDR.Master.Pokemon[pokemonID].evolution_form) {
        evolvedForm = WDR.Master.Pokemon[pokemonID].evolution_form;
      } else {
        evolvedForm = formID;
      }

      let evolvedCPs = await CalculatePossibleCPs(WDR, WDR.Master.Pokemon[pokemonID].evolutions[i].evolution_id, evolvedForm, attack, defense, stamina, level, gender, league);
      possibleCPs = possibleCPs.concat(evolvedCPs);
    }

    return resolve(possibleCPs);
  });
}


async function QueryPvPRank(WDR, pokemonID, formID, attack, defense, stamina, level, league) {
  return await new Promise(async function(resolve) {

    if (!WDR.Master.Pokemon[pokemonID].forms[formID] || !WDR.Master.Pokemon[pokemonID].forms[formID].attack) {
      formID = 0;
    }

    let pvpLeague = "wdr_pvp_" + league + "_league";

    WDR.wdrDB.query(
      `SELECT
          *
       FROM
          ${pvpLeague}
       WHERE
          pokemon_id = ${pokemonID}
          AND form = ${formID}
          AND attack = ${attack}
          AND defense = ${defense}
          AND stamina = ${stamina}
          AND level >= ${level};`,
      function(error, results) {
        if (error) {
          console.error("[WDR] [pvp.js] Cannot Select from " + pvpLeague + " table.", error);
          return resolve(null);
        } else if (results.length == 0) {
          return resolve(null);
        } else {
          return resolve({
            pokemon_id: pokemonID,
            form_id: formID,
            attack: attack,
            defense: defense,
            stamina: stamina,
            level: results[0].level,
            cp: results[0].CP,
            percent: results[0].percent,
            rank: results[0].rank,
            pvp_value: results[0].value
          });
        }
      }
    );
  });
}