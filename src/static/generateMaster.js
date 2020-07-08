const Fetch = require("node-fetch");
const Ini = require("ini");
const Fs = require("fs-extra");
var protobuf = require("protobufjs");



let MasterArray, GameMaster, Form_List, Pokemon_List, Item_List, Quest_Types;

module.exports = async (WDR) => {
  return new Promise(async resolve => {

    protobuf.load(__dirname + "/rawprotos.proto", function(err, root) {
      if (err)
        throw err;
      Fs.writeJSONSync("stuff.json", root.POGOProtos.nested.Rpc.nested, {
        spaces: "\t",
        EOL: "\n"
      });
      //Move_List = root.POGOProtos.nested.Rpc.nested.HoloPokemonMove.values;
      //Form_List =
      //Pokemon_List =
      //Quest_Types =
      //Item_List =
    });

    await Fetch_Enum("moves", "https://raw.githubusercontent.com/Furtif/POGOProtos/master/src/POGOProtos/Enums/PokemonMove.proto", 4, -2);

    Move_List = Ini.parse(Fs.readFileSync(__dirname + "/data/moves.ini", "utf-8"));
    await Fetch_Enum("forms", "https://raw.githubusercontent.com/Furtif/POGOProtos/master/src/POGOProtos/Enums/Form.proto", 4, -2);
    Form_List = Ini.parse(Fs.readFileSync(__dirname + "/data/forms.ini", "utf-8"));
    await Fetch_Enum("pokemon", "https://raw.githubusercontent.com/Furtif/POGOProtos/master/src/POGOProtos/Enums/PokemonId.proto", 4, -2);
    Pokemon_List = Ini.parse(Fs.readFileSync(__dirname + "/data/pokemon.ini", "utf-8"));
    await Fetch_Enum("quests", "https://raw.githubusercontent.com/Furtif/POGOProtos/master/src/POGOProtos/Enums/QuestType.proto", 4, -2);
    Quest_Types = Ini.parse(Fs.readFileSync(__dirname + "/data/quests.ini", "utf-8"));
    await Fetch_Enum("items", "https://raw.githubusercontent.com/Furtif/POGOProtos/master/src/POGOProtos/Inventory/Item/ItemId.proto", 4, -2);
    Item_List = Ini.parse(Fs.readFileSync(__dirname + "/data/items.ini", "utf-8"));

    GameMaster = {};

    MasterArray = await Fetch_Json("https://raw.githubusercontent.com/pokemongo-dev-contrib/pokemongo-game-master/master/versions/latest/V2_GAME_MASTER.json");
    MasterArray = MasterArray.template;

    GameMaster.Pokemon = {};
    GameMaster = await Generate_Forms(GameMaster, MasterArray);

    let pokemon_types = require(__dirname + "/data/type_effectiveness.json");
    GameMaster.Genders = ["all", "male", "female"];
    GameMaster.Pokemon_Types = pokemon_types.Types;
    GameMaster.Type_Effectiveness = require(__dirname + "/data/type_effectiveness.json");

    GameMaster.Moves = {};
    GameMaster = await Generate_Moves(GameMaster);
    GameMaster.Throw_Types = JSON.parse(`{"10": "Nice", "11": "Great", "12": "Excellent"}`)
    GameMaster.Quest_Types = await Fetch_Json("https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/questtype.json");
    GameMaster.Quest_Conditions = await Fetch_Json("https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/conditiontype.json");
    GameMaster.Quest_Reward_Types = await Fetch_Json("https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/rewardtype.json");
    GameMaster.Grunt_Types = await Fetch_Json("https://raw.githubusercontent.com/pmsf/PMSF/master/static/data/grunttype.json");
    GameMaster.Items = {};
    GameMaster = await Compile_Data(GameMaster, MasterArray);
    GameMaster = await Set_Form_Data(GameMaster)
    //GameMaster = await generate_additional_data(GameMaster);
    Fs.writeJSONSync(WDR.dir + "/src/static/master.json", GameMaster, {
      spaces: "\t",
      EOL: "\n"
    });
    console.log("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [generateMaster.js] Successfully Generated Fresh Master File.");

    return resolve();
  });
}

function Fetch_Json(url) {
  return new Promise(resolve => {
    Fetch(url)
      .then(res => res.json())
      .then(json => {
        return resolve(json);
      });
  });
}

function Fetch_Enum(type, url, front, back) {
  return new Promise(resolve => {
    Fetch(url)
      .then(res => res.text())
      .then(body => {
        let result = body.split("\n")
          .slice(front, back)
          .join("\n")
          .replace("\t", "")
          .replace(" ", "")
          .replace(";", "");
        Fs.writeFileSync(__dirname + "/data/" + type + ".ini", result);
        return resolve();
      });
  });
}

function capitalize(string) {
  try {
    string = string.toLowerCase();
    if (string.split("_").length > 1) {
      let processed = "";
      string.split("_").forEach((word) => {
        processed += " " + word.charAt(0).toUpperCase() + word.slice(1)
      });
      return processed.slice(1);
    } else {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  } catch (e) {
    console.error(e);
    console.error(string);
  }
}

function get_moves(moves) {
  return new Promise(async resolve => {
    let list = [];
    if (moves) {
      await moves.forEach(move => {
        let m = move.replace("_FAST", "").split("_");
        let new_move = capitalize(m[0]);
        if (m[1]) {
          new_move += " " + capitalize(m[1]);
        }
        list.push(new_move);
      });
    }
    return resolve(list);
  });
}

function get_evolutions(type, evolutions, id) {
  return new Promise(async resolve => {
    let list = [];
    if (type == "names") {
      if (evolutions) {
        await evolutions.forEach(evolution => {
          if (evolution.evolution || evolution.candyCost) {
            let evolution_branch = {};
            if (evolution.evolution) {
              evolution_branch.evolution = capitalize(evolution.evolution);
              evolution_branch.evolution_id = Pokemon_List[evolution.evolution.toUpperCase()];
            }
            if (evolution.candyCost) {
              evolution_branch.candy_cost = evolution.candyCost;
            }
            if (evolution.evolutionItemRequirement) {
              evolution_branch.evolution_item = capitalize(evolution.evolutionItemRequirement.replace("ITEM_", ""));
              evolution_branch.evolution_item_id = Item_List[evolution.evolutionItemRequirement.replace("ITEM_", "")]
            }
            if (evolution.genderRequirement) {
              evolution_branch.gender_requirement = evolution.genderRequirement.toLowerCase();
            }
            if (evolution_branch.form) {
              evolution_branch.form = evolution.form.split("_")[1];
              evolution_branch.form_id = Form_List[evolution.form];
            }
            list.push(evolution_branch);
          } else {
            list.push(capitalize(evolution));
          }
        });
      }
    } else if (type == "ids") {
      if (evolutions) {
        await evolutions.forEach(evolution => {
          if (evolution) {
            list.push(Pokemon_List[evolution.toUpperCase()]);
          }
        });
      }
    }
    return resolve(list);
  });
}

function Generate_Moves(GameMaster) {
  return new Promise(resolve => {
    let MoveArray = Object.keys(Move_List).map(i => i);
    for (let n = 0, len = MoveArray.length; n < len; n++) {
      let id = Move_List[MoveArray[n]];
      GameMaster.Moves[id] = {};
      GameMaster.Moves[id].name = capitalize(MoveArray[n].replace("_FAST", ""));
    }
    return resolve(GameMaster);
  });
}

function Generate_Quest_Types(GameMaster) {
  return new Promise(resolve => {
    let QuestTypeArray = Object.keys(Quest_Types).map(i => i);
    for (let n = 0, len = QuestTypeArray.length; n < len; n++) {
      let id = Quest_Types[QuestTypeArray[n]];
      GameMaster.Quest_Types[Quest_Types[QuestTypeArray[n]]] = {};
      GameMaster.Quest_Types[Quest_Types[QuestTypeArray[n]]].name = capitalize(QuestTypeArray[n].replace("QUEST_", ""));
      GameMaster.Quest_Types[Quest_Types[QuestTypeArray[n]]].proto = QuestTypeArray[n];
    }
    return resolve(GameMaster);
  });
}

// function Generate_Quest_Types(GameMaster) {
//   return new Promise(resolve => {
//     let QuestTypeArray = Object.keys(Quest_Types).map(i => i);
//     for (let n = 0, len = QuestTypeArray.length; n < len; n++) {
//       let id = Item_List[n];
//       GameMaster.Quest_Types[QuestTypeArray[n]] = Item_List[n];
//     }
//     return resolve(GameMaster);
//   });
// }

function Generate_Forms(GameMaster, MasterArray) {
  return new Promise(async resolve => {
    for (let o = 0, len = MasterArray.length; o < len; o++) {
      let object = MasterArray[o];
      if (object.templateId.split("_")[1]) {
        let pokemon_id = Number(object.templateId.split("_")[0].slice(1));
        try {
          if (object.data.formSettings && !isNaN(pokemon_id)) {
            if (!GameMaster.Pokemon[pokemon_id]) {
              GameMaster.Pokemon[pokemon_id] = {};
            }
            if (!GameMaster.Pokemon[pokemon_id].name) {
              GameMaster.Pokemon[pokemon_id].name = "";
            }
            if (!GameMaster.Pokemon[pokemon_id].default_form) {
              GameMaster.Pokemon[pokemon_id].default_form = "";
            }
            if (!GameMaster.Pokemon[pokemon_id].forms) {
              GameMaster.Pokemon[pokemon_id].forms = {};
            }
            let forms = object.data.formSettings.forms;
            if (forms) {
              GameMaster.Pokemon[pokemon_id].forms = {};
              for (let f = 0, flen = forms.length; f < flen; f++) {
                let id = Form_List[object.data.formSettings.forms[f].form];
                if (!GameMaster.Pokemon[pokemon_id].forms[id]) {
                  GameMaster.Pokemon[pokemon_id].forms[id] = {};
                }
                if (forms[f].form.split("_")[2] && !GameMaster.Pokemon[pokemon_id].forms[id].form) {
                  GameMaster.Pokemon[pokemon_id].forms[id].form = capitalize(forms[f].form.split("_")[1] + " " + forms[f].form.split("_")[2]);
                } else if (!GameMaster.Pokemon[pokemon_id].forms[id].form) {
                  GameMaster.Pokemon[pokemon_id].forms[id].form = capitalize(forms[f].form.split("_")[1]);
                }
                if (!GameMaster.Pokemon[pokemon_id].forms[id].proto) {
                  GameMaster.Pokemon[pokemon_id].forms[id].proto = object.data.formSettings.forms[f].form;
                }
              }
            }
          }
        } catch (e) {
          console.error(e);
          console.error(object);
        }
      }
    }

    let FormArray = Object.keys(Form_List).map(i => i);
    for (let f = 0, flen = FormArray.length; f < flen; f++) {

      let data = FormArray[f].split("_");
      let pokemon_name = capitalize(data[0]);
      let pokemon_id = Pokemon_List[data[0]];
      let form_name = capitalize(data[1]);
      if (data[2]) {
        form_name = form_name + " " + capitalize(data[2]);
      }
      let form_id = Form_List[FormArray[f]];

      if (!pokemon_id || (FormArray[f].indexOf("PORYGON_Z") >= 0)) {
        pokemon_id = Pokemon_List[data[0] + "_" + data[1]];
        pokemon_name = capitalize(data[0]) + " " + capitalize(data[1]);
        if (data[2]) {
          form_name = capitalize(data[2]);
        }
        form_id = Form_List[FormArray[f]];
      }

      if (pokemon_id && form_id) {
        if (!GameMaster.Pokemon[pokemon_id]) {
          GameMaster.Pokemon[pokemon_id] = {};
        }
        if (!GameMaster.Pokemon[pokemon_id].forms) {
          GameMaster.Pokemon[pokemon_id].forms = {}
        }
        if (!GameMaster.Pokemon[pokemon_id].forms[form_id]) {
          GameMaster.Pokemon[pokemon_id].forms[form_id] = {};
        }
        if (!GameMaster.Pokemon[pokemon_id].forms[form_id].form) {
          GameMaster.Pokemon[pokemon_id].forms[form_id].form = form_name;
        }
        if (!GameMaster.Pokemon[pokemon_id].forms[form_id].proto) {
          GameMaster.Pokemon[pokemon_id].forms[form_id].proto = FormArray[f];
        }
      }
    }

    return resolve(GameMaster);
  });
}

function Compile_Data(GameMaster, MasterArray) {
  return new Promise(async resolve => {
    let oddballs = [
      "MR_MIME",
      "MIME_JR",
      "HO_OH",
      "PORYGON_Z"
    ];
    for (let o = 0, len = MasterArray.length; o < len; o++) {
      let object = MasterArray[o];
      try {
        if (object.data.pokemon) {

          let pokemon_id = Number(object.templateId.split("_")[0].slice(1));

          if (!GameMaster.Pokemon[pokemon_id]) {
            GameMaster.Pokemon[pokemon_id] = {};
          }

          let Pokemon = GameMaster.Pokemon[pokemon_id];
          Pokemon.pokedex_id = pokemon_id;
          let form_id = Form_List[object.templateId.split("_")[2] + "_" + object.templateId.split("_")[3]];
          let alt_form = Form_List[object.templateId.split("_")[2] + "_" + object.templateId.split("_")[3] + "_" + object.templateId.split("_")[4]];

          if (object.templateId.split("_").length == 3 || (oddballs.some(word => object.templateId.includes(word)) && object.templateId.split("_").length == 4)) {

            Pokemon.name = capitalize(object.data.pokemon.uniqueId);
            switch (Pokemon.name) {
              case "Nidoran Female":
                Pokemon.name = "Nidoran♀";
                break;
              case "Nidoran Male":
                Pokemon.name = "Nidoran♂";
                break;
            }
            Pokemon.default_form_id = Form_List[object.data.pokemon.uniqueId + "_NORMAL"];
            if (!Pokemon.forms) {
              Pokemon.forms = {};
            }
            Pokemon.types = [];
            Pokemon.attack = object.data.pokemon.stats.baseAttack;
            Pokemon.defense = object.data.pokemon.stats.baseDefense;
            Pokemon.stamina = object.data.pokemon.stats.baseStamina;
            Pokemon.height = object.data.pokemon.pokedexHeightM;
            Pokemon.weight = object.data.pokemon.pokedexWeightKg
            Pokemon.flee_rate = object.data.pokemon.encounter.baseFleeRate;
            Pokemon.capture_rate = object.data.pokemon.encounter.baseCaptureRate;
            Pokemon.quick_moves = await get_moves(object.data.pokemon.quickMoves);
            Pokemon.charged_moves = await get_moves(object.data.pokemon.cinematicMoves);
            Pokemon.evolutions_names = await get_evolutions("names", object.data.pokemon.evolution, pokemon_id);
            Pokemon.evolutions_ids = await get_evolutions("ids", object.data.pokemon.evolution, pokemon_id);
            Pokemon.evolutions = await get_evolutions("names", object.data.pokemon.evolutionBranch, pokemon_id);
            if (object.data.pokemon.genderRequirement) {
              Pokemon.gender_requirement = object.data.pokemon.genderRequirement;
            }
            Pokemon.legendary = object.data.pokemon.pokemonClass == "POKEMON_CLASS_LEGENDARY" ? true : false;
            Pokemon.mythic = object.data.pokemon.pokemonClass == "POKEMON_CLASS_MYTHIC" ? true : false;
            Pokemon.candy_to_evolve = object.data.pokemon.candyToEvolve;
            Pokemon.buddy_group_number = object.data.pokemon.buddyGroupNumber;
            Pokemon.buddy_distance = object.data.pokemon.kmBuddyDistance;
            Pokemon.third_move_stardust = object.data.pokemon.thirdMove.stardustToUnlock;
            Pokemon.third_move_candy = object.data.pokemon.thirdMove.candyToUnlock;
            Pokemon.gym_defender_eligible = object.data.pokemon.isDeployable;
            if (object.data.pokemon.type1) {
              Pokemon.types.push(capitalize(object.data.pokemon.type1.replace("POKEMON_TYPE_", "")));
            }
            if (object.data.pokemon.type2) {
              Pokemon.types.push(capitalize(object.data.pokemon.type2.replace("POKEMON_TYPE_", "")));
            }
          } else if (form_id && form_id != undefined) {
            if (!Pokemon.forms) {
              Pokemon.forms = {};
            }
            if (!Pokemon.forms[form_id]) {
              Pokemon.forms[form_id] = {};
            }
            let Form = Pokemon.forms[form_id];
            // ADD TO POKEMON FORMS
            //Form.name = capitalize(object.data.pokemon.uniqueId);
            if (!Form.form) {
              if (object.templateId.split("_")[4]) {
                Form.form = capitalize(object.templateId.split("_")[3] + "_" + object.templateId.split("_")[4]);
              } else {
                Form.form = capitalize(object.templateId.split("_")[3]);
              }
            }
            if (object.data.pokemon.evolution) {
              Form.evolution_form = Form_List[object.data.pokemon.evolution[0] + "_" + object.templateId.split("_")[3]];
            }

            switch (true) {
              case object.data.pokemon.stats.baseAttack != Pokemon.attack:
              case object.data.pokemon.stats.baseDefense != Pokemon.defense:
              case object.data.pokemon.stats.baseStamina != Pokemon.stamina:
                Form.attack = object.data.pokemon.stats.baseAttack;
                Form.defense = object.data.pokemon.stats.baseDefense;
                Form.stamina = object.data.pokemon.stats.baseStamina;
            }
            switch (true) {
              case object.data.pokemon.pokedexHeightM != Pokemon.height:
              case object.data.pokemon.pokedexWeightKg != Pokemon.weight:
                Form.height = object.data.pokemon.pokedexHeightM;
                Form.weight = object.data.pokemon.pokedexWeightKg;
            }
            //Form.flee_rate = object.data.pokemon.encounter.baseFleeRate;
            //Form.capture_rate = object.data.pokemon.encounter.baseCaptureRate;
            //Form.quick_moves = await get_moves(object.data.pokemon.quickMoves);
            //Form.charged_moves = await get_moves(object.data.pokemon.cinematicMoves);
            //Form.evolutions = await get_evolutions("names", object.data.pokemon.evolution, pokemon_id);
            //Form.evolutions_ids = await get_evolutions("ids", object.data.pokemon.evolution, pokemon_id);
            //Form.evolution_branch = await get_evolutions("names", object.data.pokemon.evolutionBranch, pokemon_id);
            //Form.legendary = object.data.pokemon.pokemonClass == "POKEMON_CLASS_LEGENDARY" ? true : false;
            //Form.mythic = object.data.pokemon.pokemonClass == "POKEMON_CLASS_MYTHIC" ? true : false;
            //Form.candy_to_evolve = object.data.pokemon.candyToEvolve;
            //Form.buddy_group_number = object.data.pokemon.buddyGroupNumber;
            //Form.buddy_distance = object.data.pokemon.kmBuddyDistance;
            //Form.third_move_stardust = object.data.pokemon.thirdMove.stardustToUnlock;
            //Form.third_move_candy = object.data.pokemon.thirdMove.candyToUnlock;
            //Form.gym_defender_eligible = object.data.pokemon.isDeployable;
            let quick_moves = await get_moves(object.data.pokemon.quickMoves);
            if (quick_moves.toString() != Pokemon.quick_moves.toString()) {
              Form.quick_moves = quick_moves;
            }
            if (object.data.pokemon.genderRequirement) {
              Form.gender_requirement = object.data.pokemon.genderRequirement;
            }
            let charged_moves = await get_moves(object.data.pokemon.cinematicMoves);
            if (charged_moves.toString() != Pokemon.charged_moves.toString()) {
              Form.charged_moves = charged_moves;
            }
            let types = [];
            if (object.data.pokemon.type1) {
              types.push(capitalize(object.data.pokemon.type1.replace("POKEMON_TYPE_", "")));
            }
            if (object.data.pokemon.type2) {
              types.push(capitalize(object.data.pokemon.type2.replace("POKEMON_TYPE_", "")));
            }
            if (types.toString() != Pokemon.types.toString()) {
              Form.types = types;
            }
          }
        } else if (object.data.item) {
          let item_name = "";
          object.templateId.split("_").slice(1).forEach((word) => {
            item_name += " " + capitalize(word);
          });
          let item_id = Item_List[object.templateId];
          if (!GameMaster.Items[item_id]) {
            GameMaster.Items[item_id] = {}
          }
          GameMaster.Items[item_id].name = item_name.slice(1);
          GameMaster.Items[item_id].proto = object.data.templateId;
          GameMaster.Items[item_id].type = capitalize(object.data.item.itemType.replace("ITEM_TYPE_", ""));
          GameMaster.Items[item_id].category = capitalize(object.data.item.category.replace("ITEM_CATEGORY_", ""));
          if (object.data.item.dropTrainerLevel && object.data.item.dropTrainerLevel < 60) {
            GameMaster.Items[item_id].min_trainer_level = object.data.item.dropTrainerLevel;
          }
        } else if (object.data.combatMove) {
          let move_id = parseInt(object.templateId.split("_")[1].slice(1));
          //let move_id = Move_List[object.data.combatMove.uniqueId];
          if (move_id && !GameMaster.Moves[move_id]) {
            GameMaster.Moves[move_id] = {}
          } else if (!move_id && !!GameMaster.Moves[object.data.combatMove.uniqueId]) {
            GameMaster.Moves[object.data.combatMove.uniqueId] = {};
          }
          let Move = GameMaster.Moves[move_id];
          if (!Move.name) {
            Move.name = capitalize(object.data.templateId.split("_").slice(3).join(" "));
          }
          Move.proto = object.templateId;
          Move.type = capitalize(object.data.combatMove.type.replace("POKEMON_TYPE_", ""));
          Move.power = object.data.combatMove.power;
        }
      } catch (e) {
        console.error(e);
        console.error(object);
      }
    }

    // END
    return resolve(GameMaster)
  });
}

function Set_Form_Data(GameMaster) {
  return new Promise(async resolve => {
    let MFArray = Object.keys(GameMaster.Pokemon).map(i => i);
    for (let f = 0, flen = MFArray.length; f < flen; f++) {
      let id = MFArray[f];

      GameMaster.Pokemon[id].default_form_id = Object.keys(GameMaster.Pokemon[id].forms)[0];

      if (GameMaster.Pokemon[id].forms[GameMaster.Pokemon[id].default_form_id]) {
        GameMaster.Pokemon[id].default_form = GameMaster.Pokemon[id].forms[GameMaster.Pokemon[id].default_form_id].form;
      }
    }
    return resolve(GameMaster);
  });
}

function generate_additional_data(GameMaster) {
  return new Promise(async resolve => {
    let pokemon_array = Object.keys(GameMaster.Pokemon).map(p => GameMaster.Pokemon[p].forms);
    pokemon_array.forEach((pokemon) => {
      if (pokemon.forms) {
        let form_array = Object.keys(pokemon.forms).map(f => f);
        form_array.forEach((form) => {
          if (!GameMaster.Pokemon[pokemon.pokedex_id].form_array) {
            GameMaster.Pokemon[pokemon.pokedex_id].form_array = [];
          }
          GameMaster.Pokemon[pokemon.pokedex_id].form_array.push(form.form);
        });
      }
    });
    return resolve(GameMaster);
  });
}