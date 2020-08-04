const Fetch = require("node-fetch");
const Ini = require("ini");
const Fs = require("fs-extra");
var protobuf = require("protobufjs");



let MasterArray, GameMaster, Form_Proto, Pokemon_Proto, Item_Proto, Quest_Types;

var oddballs = ["MR_MIME", "MIME_JR", "HO_OH", "PORYGON_Z"];

module.exports = (WDR) => {
  return new Promise(resolve => {

    console.log("GENERATTGSGG")

    let GameMaster = {};

    protobuf.load(__dirname + "/rawprotos.proto", async function(err, root) {
      if (err) {
        throw err;
      }

      GameMaster.Pokemon = {};
      Pokemon_Proto = root.POGOProtos.nested.Rpc.nested.HoloPokemonId.values;
      for (var key in Pokemon_Proto) {
        if (Pokemon_Proto.hasOwnProperty(key)) {
          if (Pokemon_Proto[key] != 0) {
            GameMaster.Pokemon[Pokemon_Proto[key]] = {
              name: capitalize(key.split("_").slice(5).join(" ")),
              pokedex_id: Number(key.split("_")[3].slice(1))
            };
          }
          //GameMaster.Pokemon[Pokemon_Proto[key]].name = capitalize(key.split("_").slice(5).join(" "));
        }
      }

      GameMaster.Forms = {};
      Form_Proto = root.POGOProtos.nested.Rpc.nested.PokemonDisplayProto.nested.Form.values;
      for (var key in Form_Proto) {
        if (Form_Proto.hasOwnProperty(key)) {
          let key_poke = "";
          let key_form_name = "";
          let key_form_id = Form_Proto[key];
          let key_proto = key;
          if (oddballs.some(name => key.includes(name))) {
            key_poke = capitalize(key.split("_").slice(0, 1).join(" "));
            key_form_name = capitalize(key.split("_").slice(2).join(" "));
          } else {
            key_poke = capitalize(key.split("_")[0]);
            key_form_name = capitalize(key.split("_").slice(1).join(" "));
          }
          for (var key in GameMaster.Pokemon) {
            if (GameMaster.Pokemon[key].name == key_poke) {
              if (!GameMaster.Pokemon[key].forms) {
                GameMaster.Pokemon[key].forms = {};
              }
              GameMaster.Pokemon[key].forms[key_form_id] = {
                form: key_form_name,
                form_id: key_form_id,
                proto: key_proto
              };
            }
          }
        }
      }

      GameMaster.Moves = {};
      Move_Proto = root.POGOProtos.nested.Rpc.nested.HoloPokemonMove.values;
      for (var key in Move_Proto) {
        if (Move_Proto.hasOwnProperty(key)) {
          GameMaster.Moves[Move_Proto[key]] = {
            name: capitalize(key.split("_").slice(5).join(" "))
          }
        }
      }

      GameMaster.Quest_Types = {};
      Quest_Types_Proto = root.POGOProtos.nested.Rpc.nested.QuestType.values;
      let special_actions = ["catch", "spin", "hatch", "complete", "transfer", "favorite", "evolve", "land", "collect", "join", "make", "trade", "send", "win", "take", "purify", "earn"];
      for (var key in Quest_Types_Proto) {
        if (Quest_Types_Proto.hasOwnProperty(key)) {
          let quest_type_id = Quest_Types_Proto[key];
          let quest_lingo = key.toLowerCase().split("_").slice(3);
          let action = "";
          if (special_actions.some(word => quest_lingo[0] == word)) {
            quest_lingo.forEach((part, index) => {
              if (index == 0) {
                action += capitalize(part);
              } else if (index == 1) {
                action += " {0} " + part;
              } else {
                action += " " + part;
              }
            });

            if (action.indexOf("into pokemon") >= 0) {
              action = action.replace("into pokemon", "pokemon into");
            } else if (action.indexOf("combat") >= 0) {
              action = action.replace("combat", "pvp battle(s)");
            } else {
              action += "(s)";
            }
            action = action.replace("pokemon(s)", "pokémon");
            action = action.replace("pokemon", "pokémon");

          } else if (key.indexOf("BADGE_RANK") >= 0) {
            action = "Collect {0} badge(s)";
          } else if (key.indexOf("BATTLE_TEAM_ROCKET") >= 0) {
            action = "Battle against {0} Team GO Rocket Grunt(s)";
          } else if (key.indexOf("BERRY_IN_ENCOUNTER") >= 0) {
            action = "Catch {0} pokémon with berrie(s)";
          } else if (key.indexOf("BUDDY_PET") >= 0) {
            action = "Play with your Buddy {0} times";
          } else if (key.indexOf("FIRST_CATCH_OF_THE_DAY") >= 0) {
            action = "First catch of the day";
          } else if (key.indexOf("FIRST_POKESTOP_OF_THE_DAY") >= 0) {
            action = "First pokéstop of the day";
          } else if (key.indexOf("UPGRADE_POKEMON") >= 0) {
            action = "Power up a pokémon {0} times";
          } else if (key.indexOf("GET_BUDDY_CANDY") >= 0) {
            action = "Walk your buddy to earn {0} candy";
          } else if (key.indexOf("PLAYER_LEVEL") >= 0) {
            action = "Become level {0}";
          } else if (key.indexOf("ADD_FRIENDR") >= 0) {
            action = "Make {0} new friends";
          } else if (key.indexOf("FIND_TEAM_ROCKET") >= 0) {
            action = "Find Team Rocket {0} times";
          } else if (key.indexOf("FIRST_GRUNT_OF_THE_DAY") >= 0) {
            action = "First Grunt of the day";
          } else if (key.indexOf("BUDDY_EARN_AFFECTION_POINTS") >= 0) {
            action = "Earn {0} Heart(s) with your Buddy";
          }
          GameMaster.Quest_Types[quest_type_id] = {
            proto: key.split("_").slice(2).join("_"),
            text: action
          };
        }
      }

      GameMaster.Quest_Conditions = {};
      Quest_Conditions_Proto = root.POGOProtos.nested.Rpc.nested.QuestConditionProto.nested.ConditionType.values;
      for (var key in Quest_Conditions_Proto) {
        if (Quest_Conditions_Proto.hasOwnProperty(key)) {
          let quest_condition_id = Quest_Conditions_Proto[key];
          let quest_condition_text = key.split("_").slice(1).join(" ").toLowerCase();
          if (quest_condition_text == "raid level") {
            quest_condition_text = "With " + quest_condition_text;
          } else if (quest_condition_text == "super effective charge") {
            quest_condition_text = "Super effective charge move";
          } else if (quest_condition_text == "win gym battle status") {
            quest_condition_text = "Win gym battle(s)";
          } else if (quest_condition_text == "unique pokestop") {
            quest_condition_text = "Unique pokéstop(s)";
          } else if (quest_condition_text == "throw type in a row") {
            quest_condition_text = "Throw type(s) in a row";
          } else {
            quest_condition_text = quest_condition_text.charAt(0).toUpperCase() + quest_condition_text.slice(1);
          }
          GameMaster.Quest_Conditions[quest_condition_id] = {
            proto: key,
            text: quest_condition_text
          };
        }
      }

      GameMaster.Quest_Reward_Types = {};
      Quest_Reward_Proto = root.POGOProtos.nested.Rpc.nested.QuestRewardProto.nested.Type.values;
      for (var key in Quest_Reward_Proto) {
        if (Quest_Reward_Proto.hasOwnProperty(key)) {
          let reward_id = Quest_Reward_Proto[key];
          let reward_text = capitalize(key);
          GameMaster.Quest_Reward_Types[reward_id] = {
            proto: key,
            text: reward_text
          }
        }
      }

      GameMaster.Grunt_Types = {};
      Grunt_Types_Proto = root.POGOProtos.nested.Rpc.nested.EnumWrapper.nested.InvasionCharacter.values;
      for (var key in Grunt_Types_Proto) {
        if (Grunt_Types_Proto.hasOwnProperty(key)) {
          let grunt_id = Grunt_Types_Proto[key];
          let grunt_text = key.toLowerCase().split("_");
          let grunt_type = "";
          if (grunt_text[2] == "grunt") {
            grunt_type = capitalize(grunt_text[1]);
            grunt = capitalize(grunt_text[3]);
          } else if (grunt_text[1] == "executive") {
            grunt_type = capitalize(grunt_text[1]) + " " + capitalize(grunt_text[2]);
            grunt = "";
          } else if (grunt_text[1] == "grunt") {
            grunt_type = "";
            grunt = capitalize(grunt_text[2]);
          } else if (grunt_text[1] == "gruntb") {
            grunt_type = "";
            grunt = capitalize(grunt_text[2]);
          } else {
            grunt_type = capitalize(grunt_text[1]);
            grunt = "";
          }
          GameMaster.Grunt_Types[grunt_id] = {
            type: grunt_type,
            grunt: grunt
          }
        }
      }

      GameMaster.Items = {};
      Item_Proto = root.POGOProtos.nested.Rpc.nested.Item.values;
      for (var key in Item_Proto) {
        if (Item_Proto.hasOwnProperty(key)) {
          GameMaster.Items[Item_Proto[key]] = {
            name: capitalize(key.split("_").slice(2).join(" ")),
            proto: key.split("_").slice(1).join("_")
          };
        }
      }

      // Costume_Proto = root.POGOProtos.nested.Rpc.nested.PokemonDisplayProto.nested.Costume.values;
      // CHECK for _NOEVOLVE and slice it, then split by _

      //Gender_Proto = root.POGOProtos.nested.Rpc.nested.PokemonDisplayProto.nested.Gender.values;

      MasterArray = await Fetch_Json("https://raw.githubusercontent.com/pokemongo-dev-contrib/pokemongo-game-master/master/versions/latest/V2_GAME_MASTER.json");
      MasterArray = MasterArray.template;

      let pokemon_types = require(__dirname + "/data/type_effectiveness.json");
      GameMaster.Genders = ["all", "male", "female", "genderless"];
      GameMaster.Pokemon_Types = pokemon_types.Types;
      GameMaster.Type_Effectiveness = require(__dirname + "/data/type_effectiveness.json");

      GameMaster.Throw_Types = JSON.parse(`{"10": "Nice", "11": "Great", "12": "Excellent"}`);
      GameMaster = await Compile_Data(GameMaster, MasterArray);
      GameMaster = await Set_Form_Data(GameMaster)
      //GameMaster = await generate_additional_data(GameMaster);
      Fs.writeJSONSync(WDR.Dir + "/src/static/master.json", GameMaster, {
        spaces: "\t",
        EOL: "\n"
      });
      WDR.Console.log(WDR, "[generateMaster.js] Successfully Generated Fresh Master File.");

      return resolve();
    });
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

function capitalize(string) {
  try {
    string = string.toLowerCase();
    let processed = "";
    if (string.split("_").length > 1) {
      string.split("_").forEach((word) => {
        processed += " " + word.charAt(0).toUpperCase() + word.slice(1)
      });
      return processed.slice(1);
    } else if (string.split(" ").length > 1) {
      string.split(" ").forEach((word) => {
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
              evolution_branch.evolution_id = Pokemon_Proto[evolution.evolution.toUpperCase()];
            }
            if (evolution.candyCost) {
              evolution_branch.candy_cost = evolution.candyCost;
            }
            if (evolution.evolutionItemRequirement) {
              evolution_branch.evolution_item = capitalize(evolution.evolutionItemRequirement.replace("ITEM_", ""));
              evolution_branch.evolution_item_id = Item_Proto[evolution.evolutionItemRequirement.replace("ITEM_", "")]
            }
            if (evolution.genderRequirement) {
              evolution_branch.gender_requirement = evolution.genderRequirement.toLowerCase();
            }
            if (evolution_branch.form) {
              evolution_branch.form = evolution.form.split("_")[1];
              evolution_branch.form_id = Form_Proto[evolution.form];
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
            list.push(Pokemon_Proto[evolution.toUpperCase()]);
          }
        });
      }
    }
    return resolve(list);
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
        console.log(object.data);
        if (object.data.pokemon) {

          let pokemon_id = Number(object.templateId.split("_")[0].slice(1));

          if (!GameMaster.Pokemon[pokemon_id]) {
            GameMaster.Pokemon[pokemon_id] = {};
          }

          let Pokemon = GameMaster.Pokemon[pokemon_id];
          Pokemon.pokedex_id = pokemon_id;
          let form_id = Form_Proto[object.templateId.split("_")[2] + "_" + object.templateId.split("_")[3]];
          let alt_form = Form_Proto[object.templateId.split("_")[2] + "_" + object.templateId.split("_")[3] + "_" + object.templateId.split("_")[4]];

          if (object.templateId.split("_").length == 3 || (oddballs.some(word => object.templateId.includes(word)) && object.templateId.split("_").length == 4)) {
            if (!Pokemon.name) {
              Pokemon.name = capitalize(object.data.pokemon.uniqueId);
            }
            switch (Pokemon.pokedex_id) {
              case 29:
                Pokemon.name = "Nidoran♀";
                break;
              case 32:
                Pokemon.name = "Nidoran♂";
                break;
            }
            Pokemon.default_form_id = Form_Proto[object.data.pokemon.uniqueId + "_NORMAL"];
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
              Form.evolution_form = Form_Proto[object.data.pokemon.evolution[0] + "_" + object.templateId.split("_")[3]];
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
        } else if (object.data.formSettings && object.data.formSettings.forms) {
          console.log("saw form settings")
          let fslen = object.data.formSettings.forms.length;
          for (let fs = 0, flen = object.data.formSettings.forms.length; fs < fslen; fs++) {
            let formSetting = object.data.formSettings.forms[fs];
            let fs_pokemon_name = capitalize(formSetting.form.split("_")[0]);
            let fs_pokemon_id = Pokemon_Proto[formSetting.form.split("_")[0]];
            let fs_form_name = capitalize(formSetting.form.split("_")[1]);
            let fs_form_id = Form_Proto[formSetting.form];
            let asset_form = formSetting.assetBundleValue;
            if (!GameMaster.Pokemon[fs_pokemon_id]) {
              GameMaster.Pokemon[fs_pokemon_id] = {
                name: fs_pokemon_name,
                pokedex_id: fs_pokemon_id,
                forms: {}
              };
            }
            if (!GameMaster.Pokemon[fs_pokemon_id].forms[fs_form_id]) {
              GameMaster.Pokemon[fs_pokemon_id].forms[fs_form_id] = {
                form: fs_form_name,
                form_id: fs_form_id,
                proto: formSetting.form
              };
            }
            if (!GameMaster.Pokemon[fs_pokemon_id].forms[fs_form_id].asset_form) {
              !GameMaster.Pokemon[fs_pokemon_id].forms[fs_form_id].asset_form = asset_form;
            }
          }
        } else if (object.data.item) {
          let item_name = "";
          object.templateId.split("_").slice(1).forEach((word) => {
            item_name += " " + capitalize(word);
          });
          let item_id = Item_Proto["ITEM_" + object.templateId];
          if (!GameMaster.Items[item_id]) {
            GameMaster.Items[item_id] = {}
          }
          //GameMaster.Items[item_id].name = item_name.slice(1);
          //GameMaster.Items[item_id].proto = object.data.templateId;
          GameMaster.Items[item_id].type = capitalize(object.data.item.itemType.replace("ITEM_TYPE_", ""));
          GameMaster.Items[item_id].category = capitalize(object.data.item.category.replace("ITEM_CATEGORY_", ""));
          if (object.data.item.dropTrainerLevel && object.data.item.dropTrainerLevel < 60) {
            GameMaster.Items[item_id].min_trainer_level = object.data.item.dropTrainerLevel;
          }
          //console.log("item", GameMaster.Items[item_id])
        } else if (object.data.combatMove) {
          let move_id = parseInt(object.templateId.split("_")[1].slice(1));
          //let move_id = Move_Proto[object.data.combatMove.uniqueId];
          if (move_id && !GameMaster.Moves[move_id]) {
            GameMaster.Moves[move_id] = {}
          } else if (!move_id && !!GameMaster.Moves[object.data.combatMove.uniqueId]) {
            GameMaster.Moves[object.data.combatMove.uniqueId] = {};
          }
          let Move = GameMaster.Moves[move_id];
          if (!Move.name) {
            Move.name = capitalize(object.data.templateId.split("_").slice(3).join(" "));
          }
          if (!Move.proto) {
            Move.proto = object.templateId;
          }
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
      try {
        GameMaster.Pokemon[id].default_form_id = Object.keys(GameMaster.Pokemon[id].forms)[0];
      } catch (e) {
        console.error(GameMaster.Pokemon[id]);
        console.error(e);
      }
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