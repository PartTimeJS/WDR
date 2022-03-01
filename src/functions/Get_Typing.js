module.exports = async (WDR, object) => {
    return new Promise(resolve => {
        try {
            if (object.pokemon_id && WDR.Master.pokemon[object.pokemon_id]) {

                let Typing = {
                    type: '',
                    type_noemoji: ''
                };

                let types = [];
                if (object.form > 0 && WDR.Master.pokemon[object.pokemon_id].forms[object.form] && WDR.Master.pokemon[object.pokemon_id].forms[object.form].types) {
                    types = WDR.Master.pokemon[object.pokemon_id].forms[object.form].types;
                } else {
                    types = WDR.Master.pokemon[object.pokemon_id].types;
                }

                if (types.length < 1) {
                    WDR.Console.error(WDR, '[Get_Typing.js] Missing type info for ' + WDR.Master.pokemon[object.pokemon_id].name, WDR.Master.pokemon[object.pokemon_id]);
                    return resolve('');
                }

                if (object.type == 'type_array') {
                    types = types.join('|').toLowerCase().split('|');
                    return resolve(types);

                } else {

                    Typing.color = WDR.Get_Type_Color(types[0]);

                    let type1_array = WDR.Master.type_effectiveness[types[0]];
                    let type2_array = WDR.Master.type_effectiveness[types[1]];

                    if (types.length == 2) {
                        Typing.type = WDR.Emotes[types[0].toLowerCase()] + ' ' + types[0] + ' / ' + WDR.Emotes[types[1].toLowerCase()] + types[1];
                        Typing.type_noemoji = types[0] + ' / ' + types[1];
                    } else {
                        Typing.type = WDR.Emotes[types[0].toLowerCase()] + ' ' + types[0];
                        Typing.type_noemoji = types[0];
                    }

                    if (object.which == 'raid') {

                        Typing.weaknesses = '';
                        Typing.weaknesses_noemoji = '';
                        Typing.resistances = '';
                        Typing.resistances_noemoji = '';
                        Typing.immune = '';
                        Typing.immune_noemoji = '';
                        Typing.type = '';
                        Typing.type_noemoji = '';

                        let t_len = type1_array.length;
                        for (let t = 0; t < t_len; t++) {
                            if (type1_array[t] != null) {
                                let value = '';
                                if (type2_array) {
                                    value = (type1_array[t] * type2_array[t]);
                                } else {
                                    value = type1_array[t];
                                }
                                let type = WDR.Master.type_ids[t];
                                if (!type || type == 'None') {
                                    WDR.Console.error(WDR, '[Get_Typing.js] Error retrieving type.', object);
                                }
                                try {
                                    switch (true) {
                                        case (value > 1):
                                            Typing.weaknesses_noemoji += ', ' + type;
                                            Typing.weaknesses += ' ' + WDR.Emotes[type.toLowerCase()];
                                            break;
                                        case (value > 0 && value < 1):
                                            Typing.resistances_noemoji += ', ' + type;
                                            Typing.resistances += ' ' + WDR.Emotes[type.toLowerCase()];
                                            break;
                                        case (value == 0):
                                            Typing.immune_noemoji += ', ' + type;
                                            Typing.immune += ' ' + WDR.Emotes[type.toLowerCase()];
                                            break;
                                    }
                                } catch (e) {
                                    WDR.Console.error(WDR, '[functions/Get_Typing.js] Error Obtaining Typing.', object);
                                    console.error(e);
                                }
                            }
                        }

                        Typing.resistances = Typing.immune + Typing.resistances;
                        Typing.resistances_noemoji = Typing.immune_noemoji + Typing.resistances_noemoji;
                        Typing.type_noemoji = Typing.type_noemoji.slice(0, -3);
                        Typing.weaknesses = Typing.weaknesses.slice(1);
                        Typing.weaknesses_noemoji = Typing.weaknesses_noemoji.slice(2);
                        Typing.resistances = Typing.resistances.slice(1);
                        Typing.resistances_noemoji = Typing.resistances_noemoji.slice(2);
                    }

                    return resolve(Typing);
                }
            }
        } catch (e) {
            WDR.Console.error(WDR, '[functions/Get_Typing.js] Error Obtaining Typing.', e);
        }

        return resolve();
    });
};