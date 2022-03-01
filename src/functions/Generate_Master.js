/* eslint-disable no-cond-assign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-constant-condition */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-empty */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-async-promise-executor */
const Fetch = require('node-fetch');
const protobuf = require('protobufjs');

var MasterArray,
    protoType,
    Form_Proto,
    Move_Proto,
    //Grunt_Types_Proto,
    Quest_Types_Proto,
    Quest_Conditions_Proto,
    Pokemon_Names,
    Pokemon_Proto,
    Item_Proto,
    Quest_Reward_Proto;

var ID_To_Form = {},
    Form_To_ID = {}; 

var oddballs = [
    'MR_MIME', 
    'MIME_JR', 
    'HO_OH', 
    'PORYGON_Z'
];

var GameMaster = {};

module.exports = (WDR) => {
    return new Promise(async resolve => {

        try {

            let id_json = require(WDR.Dir + '/static/data/pokemonId.json');
            Pokemon_Names = Object.keys(id_json).map(i => capitalize(i.split('_').join(' ')));

            WDR.Console.info(WDR, '[Generate_Master.js] Generating Master File...');

            GameMaster = {};

            let base_proto, raw_proto, data;

            await Fetch('https://raw.githubusercontent.com/Furtif/POGOProtos/master/base/vbase.proto')
                .then(res => res.text())
                .then(body => base_proto = body);

            await WDR.Fs.writeFileSync(WDR.Dir + '/static/data/baseprotos.proto', base_proto);

            await protobuf.load(WDR.Dir + '/static/data/baseprotos.proto', async function (err, root) {
                if (err) {
                    WDR.Console.error(WDR, '[Generate_Master.js] Error in loading base_protos. This error can be ignored, but errors with missing masterfile data might be seen during operation until a proto fix is pushed.', err);
                    WDR.Console.info(WDR, '[Generate_Master.js] Continuing start-up without master file generation...');
                    return resolve();
                } else {
                    data = root.nested.POGOProtos.Rpc.nested;
                    await WDR.Fs.writeJSONSync(WDR.Dir + '/static/data/baseprotos.json', data, {
                        spaces: '\t',
                        EOL: '\n'
                    });
                    Pokemon_Proto = data.HoloPokemonId.values;
                    Move_Proto = data.HoloPokemonMove.values;
                    Quest_Types_Proto = data.QuestType.values;
                    Item_Proto = data.Item.values;
                    Form_Proto = data.PokemonDisplayProto.nested.Form.values;
                    Quest_Conditions_Proto = data.QuestConditionProto.nested.ConditionType.values;
                    //Grunt_Types_Proto = data.EnumWrapper.nested.InvasionCharacter.values;
                    Quest_Reward_Proto = data.QuestRewardProto.nested.Type.values;
                    protoType = 'base';
                    parseData();
                }
            });

            
            // eslint-disable-next-line no-inner-declarations
            async function parseData(){
                GameMaster.Pokemon = {};
                let new_pproto = {};
                for (var key in Pokemon_Proto) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (Pokemon_Proto.hasOwnProperty(key)) {
                        if (Pokemon_Proto[key] != 0) {
                            if(oddballs.some(word => key.includes(word))){
                                GameMaster.Pokemon[Pokemon_Proto[key]] = {
                                    name: capitalize(key),
                                    pokedex_id: Pokemon_Proto[key]
                                };
                            } else if(key.split('_').length > 1){
                                GameMaster.Pokemon[Pokemon_Proto[key]] = {
                                    name: capitalize(key.split('_').slice(2).join(' ')),
                                    pokedex_id: Pokemon_Proto[key]
                                };
                                Pokemon_Names.push(capitalize(key.split('_').slice(2).join(' ')));
                                new_pproto[key.split('_').slice(2).join(' ')] = Pokemon_Proto[key];
                            } else {
                                GameMaster.Pokemon[Pokemon_Proto[key]] = {
                                    name: capitalize(key),
                                    pokedex_id: Pokemon_Proto[key]
                                };
                                Pokemon_Names.push(capitalize(key));
                                new_pproto[key] = Pokemon_Proto[key];
                            }
                        }
                        //GameMaster.Pokemon[Pokemon_Proto[key]].name = capitalize(key.split("_").slice(5).join(" "));
                    }
                }
                Pokemon_Proto = new_pproto;

                GameMaster.Forms = {};
                for (var fpkey in Form_Proto) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (Form_Proto.hasOwnProperty(fpkey)) {

                        let fpkey_poke = '';
                        let fpkey_form_name = '';
                        let fpkey_form_id = Form_Proto[fpkey];
                        let fpkey_proto = fpkey;
                        
                        if(protoType == 'raw') {
                            if (fpkey.split('_').length > 3) {
                                WDR.Console.error(WDR, '[Generate_Master.js] Form_Proto fpkey length > 3');
                            } else if(oddballs.some(word => fpkey.includes(word))){
                                fpkey_poke = capitalize(fpkey.split('_').slice(0, -1).join(' '));
                                fpkey_form_name = capitalize(fpkey.split('_').slice(2).join(' '));
                            } else if (fpkey.split('_').length == 3) {
                                fpkey_poke = capitalize(fpkey.split('_').slice(0, 2).join(' '));
                                fpkey_form_name = capitalize(fpkey.split('_').slice(1).join(' '));
                                if (Pokemon_Names.indexOf(fpkey_poke) < 0) {
                                    fpkey_poke = capitalize(fpkey.split('_').slice(0, 1).join(' '));
                                    fpkey_form_name = capitalize(fpkey.split('_').slice(2).join(' '));
                                }
                            } else {
                                fpkey_poke = capitalize(fpkey.split('_')[0]);
                                fpkey_form_name = capitalize(fpkey.split('_')[1]);
                            }

                        } else if(protoType == 'base') {
                            if(oddballs.some(word => fpkey.includes(word))){
                                fpkey_poke = capitalize(fpkey.split('_').slice(0, -1).join(' '));
                                fpkey_form_name = capitalize(fpkey.split('_').slice(2).join(' '));
                            } else if (fpkey.split('_').length > 2) {
                                fpkey_poke = capitalize(fpkey.split('_').slice(0, 2).join(' '));
                                fpkey_form_name = capitalize(fpkey.split('_').slice(1).join(' '));
                                if (Pokemon_Names.indexOf(fpkey_poke) < 0) {
                                    fpkey_poke = capitalize(fpkey.split('_').slice(0, 1).join(' '));
                                    fpkey_form_name = capitalize(fpkey.split('_').slice(2).join(' '));
                                }
                            } else {
                                fpkey_poke = capitalize(fpkey.split('_')[0]);
                                fpkey_form_name = capitalize(fpkey.split('_')[1]);
                            }
                        }

                        ID_To_Form[fpkey_form_id] = fpkey;
                        Form_To_ID[fpkey] = fpkey_form_id;
                        for (var gmpkey in GameMaster.Pokemon) {
                            if (GameMaster.Pokemon[gmpkey].name == fpkey_poke) {
                                if (!GameMaster.Pokemon[gmpkey].forms) {
                                    GameMaster.Pokemon[gmpkey].forms = {};
                                }
                                GameMaster.Pokemon[gmpkey].forms[fpkey_form_id] = {
                                    form: fpkey_form_name,
                                    form_id: fpkey_form_id,
                                    proto: fpkey_proto
                                };
                            }
                        }
                    }
                }

                GameMaster.Moves = {};
                for (var mpkey in Move_Proto) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (Move_Proto.hasOwnProperty(mpkey)) {
                        if(protoType == 'raw'){
                            GameMaster.Moves[Move_Proto[mpkey]] = {
                                name: capitalize(mpkey.split('_').slice(2).join(' '))
                            };
                        } else if(protoType == 'base') {
                            GameMaster.Moves[Move_Proto[mpkey]] = {
                                name: capitalize(mpkey)
                            };
                        }
                    }
                }

                GameMaster.Quest_Types = {};
                let special_actions = ['catch', 'spin', 'hatch', 'complete', 'transfer', 'favorite', 'evolve', 'land', 'collect', 'join', 'make', 'trade', 'send', 'win', 'take', 'purify', 'earn'];
                for (var qtkey in Quest_Types_Proto) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (Quest_Types_Proto.hasOwnProperty(qtkey)) {
                        let quest_type_id = Quest_Types_Proto[qtkey];
                        let quest_lingo = qtkey.toLowerCase().split('_').slice(1);
                        let action = '';
                        if (special_actions.some(word => quest_lingo[0] == word)) {
                            quest_lingo.forEach((part, index) => {
                                if (index == 0) {
                                    action += capitalize(part);
                                } else if (index == 1) {
                                    action += ' {0} ' + part;
                                } else {
                                    action += ' ' + part;
                                }
                            });

                            if (action.indexOf('into pokemon') >= 0) {
                                action = action.replace('into pokemon', 'pokemon into');
                            } else if (action.indexOf('combat') >= 0) {
                                action = action.replace('combat', 'pvp battle(s)');
                            } else {
                                action += '(s)';
                            }
                            action = action.replace('pokemon(s)', 'pokémon');
                            action = action.replace('pokemon', 'pokémon');

                        } else if (qtkey.indexOf('BADGE_RANK') >= 0) {
                            // 18
                            action = 'Collect {0} badge(s)';

                        } else if (qtkey.indexOf('BATTLE_TEAM_ROCKET') >= 0) {
                            // 29
                            action = 'Battle against {0} Team GO Rocket Grunt(s)';

                        } else if (qtkey.indexOf('BERRY_IN_ENCOUNTER') >= 0) {
                            // 13
                            action = 'Catch {0} pokémon with berrie(s)';

                        } else if (qtkey.indexOf('BUDDY_PET') >= 0) {
                            // 35
                            action = 'Play with your Buddy {0} times';

                        } else if (qtkey.indexOf('FIRST_CATCH_OF_THE_DAY') >= 0) {
                            // 1
                            action = 'First catch of the day';

                        } else if (qtkey.indexOf('FIRST_POKESTOP_OF_THE_DAY') >= 0) {
                            // 2
                            action = 'First pokéstop of the day';

                        } else if (qtkey.indexOf('UPGRADE_POKEMON') >= 0) {
                            // 14
                            action = 'Power up a pokémon {0} times';

                        } else if (qtkey.indexOf('GET_BUDDY_CANDY') >= 0) {
                            // 17
                            action = 'Walk your buddy to earn {0} candy';

                        } else if (qtkey.indexOf('PLAYER_LEVEL') >= 0) {
                            // 19
                            action = 'Become level {0}';

                        } else if (qtkey.indexOf('ADD_FRIEND') >= 0) {
                            action = 'Make {0} new friends';

                        } else if (qtkey.indexOf('FIND_TEAM_ROCKET') >= 0) {
                            action = 'Find Team Rocket {0} times';

                        } else if (qtkey.indexOf('FIRST_GRUNT_OF_THE_DAY') >= 0) {
                            action = 'First Grunt of the day';

                        } else if (qtkey.indexOf('BUDDY_EARN_AFFECTION_POINTS') >= 0) {
                            action = 'Earn {0} Heart(s) with your Buddy';

                        } else if (qtkey.indexOf('BUDDY_FEED') >= 0) {
                            action = 'Give your buddy {0} treat(s)';

                        }

                        GameMaster.Quest_Types[quest_type_id] = {
                            proto: qtkey.split('_').slice(2).join('_'),
                            text: action
                        };

                        //GameMaster.Quest_Types[Quest_Types_Proto[qtkey]] = (qtkey.split("_").slice(3).join(" ")).toLowerCase();
                    }
                }

                GameMaster.Quest_Conditions = {};
                for (var qckey in Quest_Conditions_Proto) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (Quest_Conditions_Proto.hasOwnProperty(qckey)) {
                        let quest_condition_id = Quest_Conditions_Proto[qckey];
                        let quest_condition_text = qckey.split('_').slice(1).join(' ').toLowerCase();
                        if (quest_condition_text == 'raid level') {
                            quest_condition_text = 'With ' + quest_condition_text;
                        } else if (quest_condition_text == 'super effective charge') {
                            quest_condition_text = 'Super effective charge move';
                        } else if (quest_condition_text == 'win gym battle status') {
                            quest_condition_text = 'Win gym battle(s)';
                        } else if (quest_condition_text == 'unique pokestop') {
                            quest_condition_text = 'Unique pokéstop(s)';
                        } else if (quest_condition_text == 'throw type in a row') {
                            quest_condition_text = 'Throw type(s) in a row';
                        } else {
                            quest_condition_text = quest_condition_text.charAt(0).toUpperCase() + quest_condition_text.slice(1);
                        }
                        GameMaster.Quest_Conditions[quest_condition_id] = {
                            proto: qckey,
                            text: quest_condition_text
                        };
                    }
                }

                GameMaster.Quest_Reward_Types = {};
                for (var qrkey in Quest_Reward_Proto) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (Quest_Reward_Proto.hasOwnProperty(qrkey)) {
                        let reward_id = Quest_Reward_Proto[qrkey];
                        let reward_text = capitalize(qrkey);
                        GameMaster.Quest_Reward_Types[reward_id] = {
                            proto: qrkey,
                            text: reward_text
                        };
                    }
                }

                // GameMaster.Grunt_Types = {};
                // for (var gtkey in Grunt_Types_Proto) {
                //     if (Grunt_Types_Proto.hasOwnProperty(gtkey)) {
                //         let grunt_id = Grunt_Types_Proto[gtkey];
                //         let grunt_text = gtkey.toLowerCase().split("_");
                //         let grunt_type = "";
                //         if (grunt_text[2] == "grunt") {
                //             grunt_type = capitalize(grunt_text[1]);
                //             grunt = capitalize(grunt_text[3]);
                //         } else if (grunt_text[1] == "executive") {
                //             grunt_type = capitalize(grunt_text[1]) + " " + capitalize(grunt_text[2]);
                //             grunt = "";
                //         } else if (grunt_text[1] == "grunt") {
                //             grunt_type = "";
                //             grunt = capitalize(grunt_text[2]);
                //         } else if (grunt_text[1] == "gruntb") {
                //             grunt_type = "";
                //             grunt = capitalize(grunt_text[2]);
                //         } else {
                //             grunt_type = capitalize(grunt_text[1]);
                //             grunt = "";
                //         }
                //         GameMaster.Grunt_Types[grunt_id] = {
                //             type: grunt_type,
                //             grunt: grunt
                //         }
                //     }
                // }

                GameMaster.Items = {};
                for (var ikey in Item_Proto) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (Item_Proto.hasOwnProperty(ikey)) {
                        GameMaster.Items[Item_Proto[ikey]] = {
                            name: capitalize(ikey.split('_').slice(1).join(' ')),
                            proto: ikey.split('_').join('_')
                        };
                    }
                }

                MasterArray = await Fetch_Json('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json');

                GameMaster.Pokemon_Types = require(WDR.Dir + '/static/data/type_effectiveness.json').Types;
                //GameMaster.Grunt_Types = await Fetch_Json('https://raw.githubusercontent.com/WatWowMap/MapJS/master/static/data/grunttypes.json');
                GameMaster.Genders = {
                    0: 'all',
                    1: 'male',
                    2: 'female',
                    3: 'genderless'
                };
                GameMaster.Mega_Forms = {
                    '1': 'Mega',
                    '2': 'X',
                    '3': 'Y'
                };
                GameMaster.Type_Effectiveness = require(WDR.Dir + '/static/data/type_effectiveness.json');
                GameMaster.Throw_Types = JSON.parse('{"10": "Nice", "11": "Great", "12": "Excellent"}');
                GameMaster = await Compile_Data(GameMaster, MasterArray);
                GameMaster = await Set_Form_Data(GameMaster);
                //GameMaster = await generate_additional_data(GameMaster);
                WDR.Fs.writeJSONSync(WDR.Dir + '/static/data/master.json', GameMaster, {
                    spaces: '\t',
                    EOL: '\n'
                });
                WDR.Console.log(WDR, '[Generate_Master.js] Successfully Generated Fresh Master File.');

                return resolve();
            }
        } catch (e) {
            console.error(e);
            WDR.Console.error(WDR, '[Generate_Master.js] Unable to Generate Fresh Master File.');
            return resolve();
        }
    });
};

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
    if (String) {
        try {
            string = string.toLowerCase();
            let processed = '';
            if (string.split('_').length > 1) {
                string.split('_').forEach((word) => {
                    processed += ' ' + word.charAt(0).toUpperCase() + word.slice(1);
                });
                return processed.slice(1);
            } else if (string.split(' ').length > 1) {
                string.split(' ').forEach((word) => {
                    processed += ' ' + word.charAt(0).toUpperCase() + word.slice(1);
                });
                return processed.slice(1);
            } else {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
        } catch (e) {
            console.error(e);
            console.error(string);
        }
    } else {
        return;
    }
}

function get_moves(moves) {
    return new Promise(async resolve => {
        let list = [];
        if (moves) {
            await moves.forEach(move => {
                let m = move.replace('_FAST', '').split('_');
                let new_move = capitalize(m[0]);
                if (m[1]) {
                    new_move += ' ' + capitalize(m[1]);
                }
                list.push(new_move);
            });
        }
        return resolve(list);
    });
}

function get_evolutions(type, evolutions) {
    return new Promise(async resolve => {
        let list = [];
        if (evolutions) {
            await evolutions.forEach(evolution => {
                if (type == 'objects') {
                    if (evolution.evolution || evolution.candyCost) {
                        let evolution_branch = {};
                        if (evolution.evolution) {
                            evolution_branch.evolution = capitalize(evolution.evolution);
                            for (var id in GameMaster.Pokemon) {
                                // eslint-disable-next-line no-prototype-builtins
                                if (GameMaster.Pokemon.hasOwnProperty(id)) {
                                    if (GameMaster.Pokemon[id].name == capitalize(evolution.evolution)) {
                                        evolution_branch.evolution_id = GameMaster.Pokemon[id].pokedex_id;
                                    }
                                }
                            }
                        }
                        if (evolution.candyCost) {
                            evolution_branch.candy_cost = evolution.candyCost;
                        }
                        if (evolution.evolutionItemRequirement) {
                            evolution_branch.evolution_item = capitalize(evolution.evolutionItemRequirement.replace('ITEM_', ''));
                            evolution_branch.evolution_item_id = Item_Proto[evolution.evolutionItemRequirement.replace('ITEM_', '')];
                        }
                        if (evolution.genderRequirement) {
                            evolution_branch.gender_requirement = evolution.genderRequirement.toLowerCase();
                        }
                        if (evolution.form) {
                            if(oddballs.some(word => evolution.form.includes(word))){
                                evolution_branch.form = capitalize(evolution.form.split('_').slice(2).join(' '));
                            } else if (evolution.form.split('_').length == 3) {
                                let key_poke = capitalize(evolution.form.split('_').slice(0, 2).join(' '));
                                evolution_branch.form = capitalize(evolution.form.split('_').slice(1).join(' '));
                                if (Pokemon_Names.indexOf(key_poke) < 0) {
                                    evolution_branch.form = capitalize(evolution.form.split('_').slice(2).join(' '));
                                }
                            } else {
                                evolution_branch.form = capitalize(evolution.form.split('_')[1]);
                            }
                            evolution_branch.form_id = Form_Proto[evolution.form];
                        }
                        list.push(evolution_branch);
                    } else {
                        if (typeof evolution !== 'object') {
                            list.push(capitalize(evolution));
                        } else if (evolution.templateId && evolution.templateId.includes('TEMPORARY_EVOLUTION')) {
                            //console.log(evolution.temporaryEvolutionSettings);
                        }
                    }
                } else if (type == 'ids') {
                    list.push(Pokemon_Proto[evolution.evolution]);
                } else if (type == 'names') {
                    if (evolution.evolution) {
                        list.push(capitalize(evolution.evolution));
                    }
                }
            });
        }

        return resolve(list);
    });
}

function Compile_Data(GameMaster, MasterArray) {
    return new Promise(async resolve => {
        let oddballs = [
            'MR_MIME',
            'MIME_JR',
            'HO_OH',
            'PORYGON_Z'
        ];


        for (let o = 0, len = MasterArray.length; o < len; o++) {

            let object = MasterArray[o];

            try {
                if (object.templateId && object.templateId.includes('_POKEMON_')) {
                    if (object.data.pokemonSettings) {

                        //let poke = object.data[Object.keys(object.data)[1]];

                        let pokemon_id = Number(object.templateId.split('_')[0].slice(1));

                        if (!GameMaster.Pokemon[pokemon_id]) {
                            GameMaster.Pokemon[pokemon_id] = {};
                        }

                        let Pokemon = GameMaster.Pokemon[pokemon_id];

                        Pokemon.pokedex_id = pokemon_id;

                        let form_id = Form_Proto[object.templateId.split('_')[2] + '_' + object.templateId.split('_')[3]];
                        //let alt_form = Form_Proto[object.templateId.split('_')[2] + '_' + object.templateId.split('_')[3] + '_' + object.templateId.split('_')[4]];

                        if (object.templateId.split('_').length == 3 || (oddballs.some(word => object.templateId.includes(word)) && object.templateId.split('_').length == 4)) {

                            switch (Pokemon.pokedex_id) {
                                case 29:
                                    Pokemon.name = 'Nidoran♀';
                                    break;
                                case 32:
                                    Pokemon.name = 'Nidoran♂';
                                    break;
                            }

                            //Pokemon.default_form_id = Pokemon.name + "_NORMAL";
                            if (!Pokemon.forms) {
                                Pokemon.forms = {};
                            }

                            Pokemon.attack = object.data.pokemonSettings.stats.baseAttack;
                            Pokemon.defense = object.data.pokemonSettings.stats.baseDefense;
                            Pokemon.stamina = object.data.pokemonSettings.stats.baseStamina;

                            Pokemon.height = object.data.pokemonSettings.pokedexHeightM;
                            Pokemon.weight = object.data.pokemonSettings.pokedexWeightKg;

                            Pokemon.flee_rate = object.data.pokemonSettings.encounter.baseFleeRate;
                            Pokemon.capture_rate = object.data.pokemonSettings.encounter.baseCaptureRate;

                            Pokemon.quick_moves = await get_moves(object.data.pokemonSettings.quickMoves);
                            Pokemon.charged_moves = await get_moves(object.data.pokemonSettings.cinematicMoves);

                            Pokemon.legendary = object.data.pokemonSettings.pokemonClass == 'POKEMON_CLASS_LEGENDARY' ? true : false;
                            Pokemon.mythic = object.data.pokemonSettings.pokemonClass == 'POKEMON_CLASS_MYTHIC' ? true : false;

                            Pokemon.candy_to_evolve = object.data.pokemonSettings.candyToEvolve;
                            Pokemon.buddy_group_number = object.data.pokemonSettings.buddyGroupNumber;
                            Pokemon.buddy_distance = object.data.pokemonSettings.kmBuddyDistance;
                            Pokemon.third_move_stardust = object.data.pokemonSettings.thirdMove.stardustToUnlock;
                            Pokemon.third_move_candy = object.data.pokemonSettings.thirdMove.candyToUnlock;
                            Pokemon.gym_defender_eligible = object.data.pokemonSettings.isDeployable;

                            Pokemon.types = [];
                            if (object.data.pokemonSettings.type) {
                                Pokemon.types.push(capitalize(object.data.pokemonSettings.type.replace('POKEMON_TYPE_', '')));
                            }
                            if (object.data.pokemonSettings.type2) {
                                Pokemon.types.push(capitalize(object.data.pokemonSettings.type2.replace('POKEMON_TYPE_', '')));
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
                            //Form.name = capitalize(object.data.pokemonSettings.uniqueId);
                            if (!Form.form) {
                                if (object.templateId.split('_')[4]) {
                                    Form.form = capitalize(object.templateId.split('_')[3] + '_' + object.templateId.split('_')[4]);
                                } else {
                                    Form.form = capitalize(object.templateId.split('_')[3]);
                                }
                            }
                            if (object.data.pokemonSettings.evolution) {
                                Form.evolution_form = Form_Proto[object.data.pokemonSettings.evolution[0] + '_' + object.templateId.split('_')[3]];
                            }

                            switch (true) {
                                case object.data.pokemonSettings.stats.baseAttack != Pokemon.attack:
                                case object.data.pokemonSettings.stats.baseDefense != Pokemon.defense:
                                case object.data.pokemonSettings.stats.baseStamina != Pokemon.stamina:
                                    Form.attack = object.data.pokemonSettings.stats.baseAttack;
                                    Form.defense = object.data.pokemonSettings.stats.baseDefense;
                                    Form.stamina = object.data.pokemonSettings.stats.baseStamina;
                            }
                            switch (true) {
                                case object.data.pokemonSettings.pokedexHeightM != Pokemon.height:
                                case object.data.pokemonSettings.pokedexWeightKg != Pokemon.weight:
                                    Form.height = object.data.pokemonSettings.pokedexHeightM;
                                    Form.weight = object.data.pokemonSettings.pokedexWeightKg;
                            }
                            //Form.flee_rate = object.data.pokemonSettings.encounter.baseFleeRate;
                            //Form.capture_rate = object.data.pokemonSettings.encounter.baseCaptureRate;
                            //Form.quick_moves = await get_moves(object.data.pokemonSettings.quickMoves);
                            //Form.charged_moves = await get_moves(object.data.pokemonSettings.cinematicMoves);
                            //Form.evolution_branch = await get_evolutions("names", object.data.pokemonSettings.evolutionBranch, pokemon_id);
                            //Form.legendary = object.data.pokemonSettings.pokemonClass == "POKEMON_CLASS_LEGENDARY" ? true : false;
                            //Form.mythic = object.data.pokemonSettings.pokemonClass == "POKEMON_CLASS_MYTHIC" ? true : false;
                            //Form.candy_to_evolve = object.data.pokemonSettings.candyToEvolve;
                            //Form.buddy_group_number = object.data.pokemonSettings.buddyGroupNumber;
                            //Form.buddy_distance = object.data.pokemonSettings.kmBuddyDistance;
                            //Form.third_move_stardust = object.data.pokemonSettings.thirdMove.stardustToUnlock;
                            //Form.third_move_candy = object.data.pokemonSettings.thirdMove.candyToUnlock;
                            //Form.gym_defender_eligible = object.data.pokemonSettings.isDeployable;
                            let quick_moves = await get_moves(object.data.pokemonSettings.quickMoves);
                            if (quick_moves.toString() != Pokemon.quick_moves.toString()) {
                                Form.quick_moves = quick_moves;
                            }
                            if (object.data.pokemonSettings.genderRequirement) {
                                Form.gender_requirement = object.data.pokemonSettings.genderRequirement;
                            }
                            let charged_moves = await get_moves(object.data.pokemonSettings.cinematicMoves);
                            if (charged_moves.toString() != Pokemon.charged_moves.toString()) {
                                Form.charged_moves = charged_moves;
                            }
                            let types = [];
                            if (object.data.pokemonSettings.type) {
                                types.push(capitalize(object.data.pokemonSettings.type.replace('POKEMON_TYPE_', '')));
                            }
                            if (object.data.pokemonSettings.type2) {
                                types.push(capitalize(object.data.pokemonSettings.type2.replace('POKEMON_TYPE_', '')));
                            }
                            if (types.toString() != Pokemon.types.toString()) {
                                Form.types = types;
                            }
                        }
                    } else {
                        //console.log(object.data)
                    }

                } else if (object.templateId && object.templateId.startsWith('FORMS_')) {
                    //} else if (object.data.formSettings && object.data.formSettings.forms) {
                    let formSettings = object.data[Object.keys(object.data)[1]];
                    let forms = formSettings[Object.keys(formSettings)[1]];
                    if (forms) {
                        for (let fs = 0, fslen = forms.length; fs < fslen; fs++) {
                            //let formSetting = object.data.formSettings.forms[fs];
                            let formSetting = forms[fs][Object.keys(forms[fs])[0]];
                            let fs_pokemon_name = capitalize(formSetting.form.split('_')[0]);
                            let fs_pokemon_id = Pokemon_Proto[formSetting.split('_')[0]];
                            //let fs_form_name = capitalize(formSetting.form.split("_")[1]);
                            let fs_form_name = capitalize(formSetting.split('_')[1]);
                            //let fs_form_id = Form_Proto[formSetting.form];
                            let fs_form_id = Form_To_ID[formSetting];
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
                                    proto: formSetting
                                };
                            }
                        }
                    }


                } else if (object.templateId && object.templateId.includes('ITEM_')) {
                    //} else if (object.data.item) {

                    // let item_name = "";
                    // object.templateId.split("_").slice(1).forEach((word) => {
                    //   item_name += " " + capitalize(word);
                    // });
                    // let item_id = Item_Proto["ITEM_" + object.templateId];
                    // if (!GameMaster.Items[item_id]) {
                    //   GameMaster.Items[item_id] = {}
                    // }
                    // //GameMaster.Items[item_id].name = item_name.slice(1);
                    // //GameMaster.Items[item_id].proto = object.data.templateId;
                    // GameMaster.Items[item_id].type = capitalize(object.data.item.itemType.replace("ITEM_TYPE_", ""));
                    // GameMaster.Items[item_id].category = capitalize(object.data.item.category.replace("ITEM_CATEGORY_", ""));
                    // if (object.data.item.dropTrainerLevel && object.data.item.dropTrainerLevel < 60) {
                    //   GameMaster.Items[item_id].min_trainer_level = object.data.item.dropTrainerLevel;
                    // }


                } else if (object.data.combatMove) {
                    let move_id = parseInt(object.templateId.split('_')[1].slice(1));
                    //let move_id = Move_Proto[object.data.combatMove.uniqueId];
                    if (move_id && !GameMaster.Moves[move_id]) {
                        GameMaster.Moves[move_id] = {};
                    } else if (!move_id && !!GameMaster.Moves[object.data.combatMove.uniqueId]) {
                        GameMaster.Moves[object.data.combatMove.uniqueId] = {};
                    }
                    let Move = GameMaster.Moves[move_id];
                    if (!Move.name) {
                        Move.name = capitalize(object.data.templateId.replace('_FAST', '').split('_').slice(3).join(' '));
                    }
                    if (!Move.proto) {
                        Move.proto = object.templateId;
                    }
                    Move.type = capitalize(object.data.combatMove.type.replace('POKEMON_TYPE_', ''));
                    Move.power = object.data.combatMove.power;
                }
            } catch (e) {
                console.error(e);
                console.error(object.data);
            }
        }

        // END
        return resolve(GameMaster);
    });
}

function Set_Form_Data(GameMaster) {
    return new Promise(async resolve => {
        let MFArray = Object.keys(GameMaster.Pokemon).map(i => i);
        for (let f = 0, flen = MFArray.length; f < flen; f++) {
            let id = MFArray[f];
            try {
                GameMaster.Pokemon[id].default_form_id = Object.keys(GameMaster.Pokemon[id].forms)[0];
                if (GameMaster.Pokemon[id].forms[GameMaster.Pokemon[id].default_form_id]) {
                    GameMaster.Pokemon[id].default_form = GameMaster.Pokemon[id].forms[GameMaster.Pokemon[id].default_form_id].form;
                }
            } catch (e) {
                if(!GameMaster.Pokemon[id]){
                    console.error(GameMaster.Pokemon[id]);
                    console.error(e);
                }
            }
        }
        return resolve(GameMaster);
    });
}

// function generate_additional_data(GameMaster) {
//     return new Promise(async resolve => {
//         let pokemon_array = Object.keys(GameMaster.Pokemon).map(p => GameMaster.Pokemon[p].forms);
//         pokemon_array.forEach((pokemon) => {
//             if (pokemon.forms) {
//                 let form_array = Object.keys(pokemon.forms).map(f => f);
//                 form_array.forEach((form) => {
//                     if (!GameMaster.Pokemon[pokemon.pokedex_id].form_array) {
//                         GameMaster.Pokemon[pokemon.pokedex_id].form_array = [];
//                     }
//                     GameMaster.Pokemon[pokemon.pokedex_id].form_array.push(form.form);
//                 });
//             }
//         });
//         return resolve(GameMaster);
//     });
// }