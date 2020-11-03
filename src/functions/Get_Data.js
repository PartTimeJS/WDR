module.exports = async (MAIN, object) => {
    return new Promise(async resolve => {
        let locale = {
            pokemon_name: '',
            form: '',
            move_1: '',
            move_2: '',
        }

        // GET DEFAULT FORM NUMBER IF A PROPER FORM ISN'T PASSED
        if (object.pokemon_id && WDR.Master.Pokemon[object.pokemon_id]) {
            if (!object.form && WDR.Master.Pokemon[object.pokemon_id].default_form) {
                object.form = WDR.Master.Pokemon[object.pokemon_id].default_form;
            }
        }

        // POKEMON NAME AND FORM
        if (object.pokemon_id) {
            locale.pokemon_name = WDR.Master.Pokemon[object.pokemon_id].name;
        }
        if (object.form && object.form > 0) {
            if (!WDR.Master.Pokemon[object.pokemon_id].forms[object.form]) {
                console.error('[masterfile.json] Missing form info for (' + object.pokemon_id + ')' + ' Form:' + object.form);
                locale.form = '[Unknown] ';
            } else {
                locale.form = '[' + WDR.Master.Pokemon[object.pokemon_id].forms[object.form].name + '] ';
            }
        }

        // MOVE NAMES
        if (object.move_1) {
            if (WDR.masterfile.moves[object.move_1]) {
                locale.move_1 = WDR.masterfile.moves[object.move_1].name;
            } else {
                console.error('[masterfile.json] Missing move info for move(' + object.move_1 + ')');
                locale.move_1 = object.move_1;
            }
        }
        if (object.move_2) {
            if (WDR.masterfile.moves[object.move_2]) {
                locale.move_2 = WDR.masterfile.moves[object.move_2].name;
            } else {
                console.error('[masterfile.json] Missing move info for move(' + object.move_2 + ')');
                locale.move_2 = object.move_2;
            }
        }

        // IF LURE NAME
        if (object.lure_id) {
            locale.lure_type = WDR.Get_Lure(MAIN, object.lure_id);
        }

        return resolve(locale);
    });
}