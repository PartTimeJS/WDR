const baseStats = require("./master.json");
const cpMultiplier = require("./data/cp_multiplier.json");

let pokemon = {};
let pokemonObject = baseStats.Pokemon;

function CalculateAllRanks(WDR) {
  return new Promise(async resolve => {

    let total_calculations = Object.keys(WDR.Master.Pokemon).map(i => WDR.Master.Pokemon[i].name).length;

    WDR.Console.log(WDR,"[PvP_Ranks.js] Beginning Ultra League Table Data Generation...");

    const ultrabar = new WDR.cliProgress.SingleBar({
      format: "[PvP_Ranks.js] Calculating... " + WDR.Colors.cyan("{bar}") + " {percentage}% {value}/{total} | ETA: {eta_formatted}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true
    });

    ultrabar.start(total_calculations, 0);

    for (var pokemonID in pokemonObject) {

      if (pokemonObject[pokemonID].attack) {
        CalculateTopRanks(WDR, pokemonID, -1, 2500);
      }

      for (var formID in pokemonObject[pokemonID].forms) {
        if (pokemonObject[pokemonID].forms[formID].attack) {
          CalculateTopRanks(WDR, pokemonID, formID, 2500);
        }
      }
      ultrabar.increment();
      //ultrabar.update(pokemonID);
    }
    ultrabar.stop();

    await WritePvPData(WDR, pokemon, "wdr_pvp_ultra_league", total_calculations);

    //fs.writeFileSync("./ultra_pvp_ranks.json",JSON.stringify(pokemon));

    WDR.Console.log(WDR,"[PvP_Ranks.js] Beginning Great League Table Data Generation...");

    const greatbar = new WDR.cliProgress.SingleBar({
      format: "[PvP_Ranks.js] Calculating... " + WDR.Colors.cyan("{bar}") + " {percentage}% | {value}/{total} | ETA: {eta_formatted}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true
    });

    greatbar.start(total_calculations, 0);

    for (var pokemonID in pokemonObject) {
      if (pokemonObject[pokemonID].attack) {
        CalculateTopRanks(WDR, pokemonID, -1, 1500);
      }
      for (var formID in pokemonObject[pokemonID].forms) {
        if (pokemonObject[pokemonID].forms[formID].attack) {
          CalculateTopRanks(WDR, pokemonID, formID, 1500);
        }
      }
      greatbar.increment();
    }
    greatbar.stop();

    //fs.writeFileSync("./great_pvp_ranks.json",JSON.stringify(pokemon));

    await WritePvPData(WDR, pokemon, "wdr_pvp_great_league", total_calculations);

    WDR.Console.log(WDR,"[PvP_Ranks.js] All PvP Table data generation is Complete.");

    return resolve();
  });
}



function CalculateTopRanks(WDR, pokemonID, formID, cap) {
  //WDR.Console.log(WDR,"[PvP_Ranks.js] Calculating Top Ranks for: " + baseStats.Pokemon[pokemonID].name + " which is number: " + pokemonID + " and Form ID: " + formID);

  let currentPokemon = InitializeBlankPokemon();
  let bestStat = {
    attack: 0,
    defense: 0,
    stamina: 0,
    value: 0
  };
  let arrayToSort = [];

  if (!pokemon[pokemonID]) {
    pokemon[pokemonID] = {};
  }

  for (a = 0; a <= 15; a++) {
    for (d = 0; d <= 15; d++) {
      for (s = 0; s <= 15; s++) {
        let currentStat = CalculateBestPvPStat(pokemonID, formID, a, d, s, cap);

        if (currentStat.value > bestStat.value) {
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
          level: currentStat.level,
          CP: currentStat.CP
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

  for (var i = 0; i < arrayToSort.length; i++) {
    let percent = PrecisionRound((arrayToSort[i].value / best) * 100, 2);
    arrayToSort[i].percent = percent;
    currentPokemon[arrayToSort[i].attack][arrayToSort[i].defense][arrayToSort[i].stamina].percent = percent;
    currentPokemon[arrayToSort[i].attack][arrayToSort[i].defense][arrayToSort[i].stamina].rank = i + 1;
  }

  if (formID >= 0) {
    if (!pokemon[pokemonID].forms) {
      pokemon[pokemonID].forms = {};
    }
    pokemon[pokemonID].forms[formID] = currentPokemon;
  } else {
    pokemon[pokemonID] = currentPokemon;
  }

  return currentPokemon;
}

function CalculateBestPvPStat(pokemonID, formID, attack, defense, stamina, cap) {
  if (pokemonID == 59) {
    let pause = true;
  }
  let bestStat = 0;
  let level = 0;
  let bestCP = 0;
  for (var i = 1; i <= 40; i += .5) {
    let CP = CalculateCP(pokemonID, formID, attack, defense, stamina, i);
    if (CP <= cap) {

      let stat = CalculatePvPStat(pokemonID, formID, i, attack, defense, stamina);
      if (stat > bestStat) {
        bestStat = stat;
        level = i;
        bestCP = CP;
      }
    }
  }

  return {
    value: bestStat,
    level: level,
    CP: bestCP
  };
}

function CalculatePvPStat(pokemonID, formID, level, attack, defense, stamina) {

  let pokemonAttack = (formID >= 0 && pokemonObject[pokemonID].forms[formID].attack) ? pokemonObject[pokemonID].forms[formID].attack : pokemonObject[pokemonID].attack;
  let pokemonDefense = (formID >= 0 && pokemonObject[pokemonID].forms[formID].defense) ? pokemonObject[pokemonID].forms[formID].defense : pokemonObject[pokemonID].defense;
  let pokemonStamina = (formID >= 0 && pokemonObject[pokemonID].forms[formID].stamina) ? pokemonObject[pokemonID].forms[formID].stamina : pokemonObject[pokemonID].stamina;

  attack = (attack + pokemonAttack) * cpMultiplier[level];
  defense = (defense + pokemonDefense) * cpMultiplier[level];
  stamina = (stamina + pokemonStamina) * cpMultiplier[level];

  product = attack * defense * Math.floor(stamina);

  product = Math.round(product);

  return product;
}

function CalculateCP(pokemonID, formID, attack, defense, stamina, level) {
  let CP = 0;


  let CPMultiplier = cpMultiplier[level];

  let pokemonAttack = (formID >= 0 && pokemonObject[pokemonID].forms[formID].attack) ? pokemonObject[pokemonID].forms[formID].attack : pokemonObject[pokemonID].attack;
  let pokemonDefense = (formID >= 0 && pokemonObject[pokemonID].forms[formID].defense) ? pokemonObject[pokemonID].forms[formID].defense : pokemonObject[pokemonID].defense;
  let pokemonStamina = (formID >= 0 && pokemonObject[pokemonID].forms[formID].stamina) ? pokemonObject[pokemonID].forms[formID].stamina : pokemonObject[pokemonID].stamina;

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
}

function InitializeBlankPokemon() {
  let newPokemon = {};

  for (var a = 0; a <= 15; a++) {
    newPokemon[a] = {};

    for (var d = 0; d <= 15; d++) {
      newPokemon[a][d] = {};

      for (var s = 0; s <= 15; s++) {
        newPokemon[a][d][s] = {};
      }
    }
  }

  return newPokemon;

}

function PrecisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

async function WritePvPData(WDR, data, tableName, number) {
  return await new Promise(async function(resolve) {

    await CreateTable(WDR, tableName);

    let progressbar = new WDR.cliProgress.SingleBar({
      format: "[PvP_Ranks.js]　 Now Saving... " + WDR.Colors.cyan("{bar}") + " {percentage}% {value}/{total} | ETA: {eta_formatted}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true
    });

    progressbar.start(number, 0);

    for (let pokemon in data) {
      if (data[pokemon].forms) {
        for (let form in data[pokemon].forms) {
          //WDR.Console.log(WDR,"[PvP_Ranks.js] Inserting pokemonID: " + pokemon + " and formID: " + form);
          let currentPokemon = data[pokemon].forms[form];
          await InsertCurrentPokemon(WDR, tableName, parseInt(pokemon), parseInt(form), currentPokemon);
        }
      } else {
        //WDR.Console.log(WDR,"[PvP_Ranks.js] Inserting pokemonID: " + pokemon + " which has no form");
        let currentPokemon = data[pokemon];
        if (pokemon == "59") {
          let pause = true;
        }
        await InsertCurrentPokemon(WDR, tableName, parseInt(pokemon), 0, currentPokemon);
      }
      progressbar.increment();
    }
    progressbar.stop();
    return resolve(true);
  });
}

async function CreateTable(WDR, tableName) {
  return await new Promise(async function(resolve) {
    let sqlQuery = "CREATE TABLE IF NOT EXISTS `" + tableName + "` ( `pokemon_id` smallint(6) unsigned NOT NULL, `form` smallint(6) unsigned DEFAULT 0, `attack` tinyint(2) unsigned DEFAULT 0, `defense` tinyint(2) unsigned DEFAULT 0, `stamina` tinyint(2) unsigned DEFAULT 0, `CP` smallint(4) UNSIGNED DEFAULT 0, `level` DOUBLE(3,1) UNSIGNED DEFAULT 0, `rank` smallint(4) UNSIGNED DEFAULT 0, `percent` DOUBLE(5, 2) UNSIGNED DEFAULT 0, `value` mediumint(8) UNSIGNED DEFAULT 0, PRIMARY KEY(pokemon_id, form, attack, defense, stamina))";

    WDR.wdrDB.query(
      sqlQuery,
      function(error, results) {
        if (error) {
          throw error;
        }

        WDR.wdrDB.query("TRUNCATE " + tableName + ";", async function(error, results) {
          if (error) {
            throw error;
          }
          return resolve(true);
        });
      }
    );
  });
}

async function InsertCurrentPokemon(WDR, tableName, pokemonID, formID, pokemon) {
  return await new Promise(async function(resolve) {
    let sqlStatement = "INSERT INTO `" + tableName + "` (`pokemon_id`, `form`, `attack`, `defense`, `stamina`, `CP`, `level`, `percent`, `rank`, `value`) VALUES";
    for (let attack in pokemon) {
      for (let defense in pokemon[attack]) {
        for (let stamina in pokemon[attack][defense]) {
          let currentValue = pokemon[attack][defense][stamina];
          sqlStatement = sqlStatement + "(" + pokemonID + "," + formID + "," + parseInt(attack) + "," + parseInt(defense) + "," + parseInt(stamina) + "," + currentValue.CP + "," + currentValue.level + "," + currentValue.percent + "," + currentValue.rank + "," + currentValue.value + "),"
          //finished.push(WritePokemonRow(WDR.wdrDB, tableName, pokemonID, formID, parseInt(attack), parseInt(defense), parseInt(stamina), currentValue.CP, currentValue.level, currentValue.percent, currentValue.rank, currentValue.value));
        }
      }
    }

    sqlStatement = sqlStatement.slice(0, -1);
    sqlStatement = sqlStatement + ";";

    WDR.wdrDB.query(sqlStatement, async function(error, results) {
      if (error) {
        throw error;
      }
      return resolve(true);
    });
  });
}

module.exports = (WDR) => {
  return new Promise(async resolve => {
    await CalculateAllRanks(WDR);
    return resolve();
  });
}