/* eslint-disable no-async-promise-executor */
module.exports = async (WDR, Quest) => {
    return new Promise(async resolve => {

        if (Quest.conditions[0]) {
            Quest.condition_type = Quest.conditions[0].type;
            Quest.condition_info = Quest.conditions[0].info;
        }

        if (!WDR.Master.quest_types[Quest.type]) {
            WDR.Console.error(WDR, '[Get_Quest_Task.js] No Type Information found for type ' + Quest.type);
            return resolve();

        } else {

            Quest.task = WDR.Master.quest_types[Quest.type].text;

            if (Quest.condition_type > 0) {
                switch (Quest.condition_type) {
                    case 1:
                        var tstr = '';
                        if (Quest.condition_info.pokemon_type_ids.length > 1) {
                            Quest.condition_info.pokemon_type_ids.forEach((typeId, index) => {
                                if (index === Quest.condition_info.pokemon_type_ids.length - 2) {
                                    tstr += WDR.Master.type_ids[typeId] + ' or ';
                                } else if (index === Quest.condition_info.pokemon_type_ids.length - 1) {
                                    tstr += WDR.Master.type_ids[typeId];
                                } else {
                                    tstr += WDR.Master.type_ids[typeId] + ', ';
                                }
                            });
                        } else {
                            tstr = WDR.Master.type_ids[Quest.condition_info.pokemon_type_ids];
                        }
                        if (Quest.conditions[1] && Quest.conditions[1].type === 21) {
                            Quest.task = Quest.task.replace('Catch {0}', 'Catch {0} Different Species of');
                        }
                        Quest.task = Quest.task.replace('pokémon', tstr + '-type Pokémon');
                        Quest.task = Quest.task.replace('Snapshot(s)', 'Snapshot(s) of ' + tstr + '-Type Pokémon');
                        break;

                    case 2:
                        var pstr = '';
                        if (Quest.condition_info.pokemon_ids.length > 1) {
                            Quest.condition_info.pokemon_ids.forEach((pokeId, index) => {
                                if (index === Quest.condition_info.pokemon_ids.length - 2) {
                                    pstr += WDR.Master.pokemon[pokeId] + ' or ';
                                } else if (index === Quest.condition_info.pokemon_ids.length - 1) {
                                    pstr += WDR.Master.pokemon[pokeId];
                                } else {
                                    pstr += WDR.Master.pokemon[pokeId] + ', ';
                                }
                            });
                        } else {
                            pstr = WDR.Master.pokemon[Quest.condition_info.pokemon_ids[0]].name;
                        }
                        Quest.task = Quest.task.replace('pokémon', pstr);
                        Quest.task = Quest.task.replace('Snapshot(s)', 'Snapshot(s) of ' + pstr);
                        break;

                    case 3:
                        Quest.task = Quest.task.replace('pokémon', 'Pokémon with Weather Boost');
                        break;

                    case 6:
                        Quest.task = Quest.task.replace('Complete', 'Win');
                        break;

                    case 7:
                        var raidLevel = Math.min.apply(null, Quest.condition_info.raid_levels);
                        if (raidLevel > 1) {
                            Quest.task = Quest.task.replace('raid battle(s)', 'Level ' + raidLevel + ' or Higher Raid');
                        }
                        if (Quest.conditions[1] && Quest.conditions[1].type === 6) {
                            Quest.task = Quest.task.replace('Complete', 'Win');
                        }
                        break;

                    case 8:
                        Quest.task = Quest.task.replace('Land', 'Make');
                        Quest.task = Quest.task.replace('throw(s)', WDR.Master.throw_types[Quest.condition_info.throw_type_id] + ' Throw(s)');
                        if (Quest.conditions[1] && Quest.conditions[1].type === 15) {
                            Quest.task = Quest.task.replace('Throw(s)', 'Curveball Throw(s)');
                        }
                        Quest.task.replace('a Excellent', 'an Excellent');
                        break;
                    case 9:
                        Quest.task = Quest.task.replace('Complete', 'Win');
                        break;

                    case 10:
                        Quest.task = Quest.task.replace('Complete', 'Use a Super Effective Charged Attack in');
                        break;

                    case 11:
                        if (!Quest.condition_info) {
                            Quest.task = Quest.task.replace('Evolve', 'Use an Item to Evolve');
                        } else if (Quest.type === 13) {
                            Quest.task = Quest.task.replace('Catch', 'Use');
                            if(Quest.condition_info.item_id){
                                Quest.task = Quest.task.replace('pokémon with berrie(s)', `${WDR.Master.items[Quest.condition_info.item_id]}(s) on Pokémon`);
                            } else {
                                Quest.task = Quest.task.replace('pokémon with berrie(s)', 'Berrie(s) on Pokémon');
                            }
                        } else {
                            console.error('Found unfinished quest type', Quest, Quest.condition_info);
                        } break;

                    case 12:
                        Quest.task = Quest.task.replace('pokéstop(s)', 'Pokéstop(s) You Haven\'t Visited Before'); break;

                    case 14:
                        Quest.task = Quest.task.replace('Land', 'Make');
                        if (typeof Quest.condition_info.throw_type_id === 'undefined') {
                            Quest.task = Quest.task.replace('throw(s)', 'Throw(s) in a row');
                        } else {
                            Quest.task = Quest.task.replace('throw(s)', WDR.Master.throw_types[Quest.condition_info.throw_type_id] + ' Throw(s) in a Row');
                        }
                        if (Quest.conditions[1] && Quest.conditions[1].type === 15) {
                            Quest.task = Quest.task.replace('Throw(s)', 'Curveball Throw(s)');
                        }
                        break;

                    case 22:
                        Quest.task = Quest.task.replace('Win', 'Battle a Team Leader').replace('pvp battle(s)', 'Times');
                        break;

                    case 23:
                        Quest.task = Quest.task.replace('Win', 'Battle Another Trainer').replace('pvp battle(s)', 'Times');
                        break;

                    case 25:
                        Quest.task = Quest.task.replace('{0} pokémon', 'Pokémon Caught ' + Quest.condition_info['distance'] + 'km Apart');
                        break;

                    case 27:
                        var gstr = '';
                        Quest.conditions[0].info.character_category_ids.forEach((charId, index) => {
                            if (index === (Quest.conditions[0].info.character_category_ids.length - 2)) {
                                gstr += WDR.Master.invasions[charId].type + ' or ';
                            } else if (index === (Quest.conditions[0].info.character_category_ids.length - 1)) {
                                gstr += WDR.Master.invasions[charId].type;
                            } else {
                                gstr += WDR.Master.invasions[charId].type + ', ';
                            }
                        });
                        Quest.task = Quest.task.replace('Team GO Rocket Grunt(s)', gstr);
                        if (Quest.conditions[1] && Quest.conditions[1].type === 18) {
                            Quest.task = Quest.task.replace('Battle against', 'Defeat');
                        }
                        break;

                    case 28:
                        if (Quest.type === 28) {
                            Quest.task = Quest.task.replace('Snapshot(s)', 'Snapshot(s) of Your Buddy');
                        }
                        break;

                }
            } else if (Quest.type > 0) {
                switch (Quest.type) {
                    case 7:
                        Quest.task = Quest.task.replace('Complete', 'Battle in a Gym').replace('gym battle(s)', 'Times');
                        break;
                    case 8:
                        Quest.task = Quest.task.replace('Complete', 'Battle in a Raid').replace('raid battle(s)', 'Times');
                        break;
                    case 13:
                        Quest.task = Quest.task.replace('Catch', 'Use').replace('pokémon with berrie(s)', 'Berries to Help Catch Pokémon');
                        break;
                    case 17:
                        Quest.task = Quest.task.replace('Walk your buddy to earn', 'Earn').replace('candy', 'Candy Walking with Your Buddy');
                        break;
                }
            }

            Quest.task = Quest.task.replace('{0}', Quest.target);

            if (Quest.target === 1) {
                Quest.task = Quest.task.replace('(s)', '').replace('1 ', 'a ').replace(' a Times', '').replace('friends', 'Friend');
            } else {
                Quest.task = Quest.task.replace('(s)', 's');
            }
        
            Quest.task = await WDR.Capitalize(Quest.task);

            return resolve(Quest);
        }
    });
};