module.exports = (WDR, Object) => {
    let sprite = null;

    if (Object.pokemon_id > 0) {
        let form_id = '',
            costume_id = '',
            mega_id = '',
            gender_id = '';

        if (Object.form > 0) {
            if (WDR.Master.pokemon[Object.pokemon_id].forms[Object.form] && WDR.Master.pokemon[Object.pokemon_id].forms[Object.form].form_id) {
                form_id = '-f' + WDR.Master.pokemon[Object.pokemon_id].forms[Object.form].form_id;
            }
        }

        if (Object.evolution > 0) {
            mega_id = '-e' + Object.evolution;
        }

        if (Object.costume && Object.costume > 0) {
            costume_id = '-c' + Object.costume;
        }

        if (Object.gender_id && Object.gender_id > 0) {
            gender_id = '-g' + Object.gender_id;
        }

        if (WDR.ICONS.pokemon.includes(Object.pokemon_id + form_id + mega_id + costume_id + gender_id)) {
            return (WDR.Config.ICONS_URL + '/pokemon/' + Object.pokemon_id + form_id + mega_id + costume_id + gender_id + '.png');

        } else if (WDR.ICONS.pokemon.includes(Object.pokemon_id + form_id + mega_id + costume_id)) {
            return (WDR.Config.ICONS_URL + '/pokemon/' + Object.pokemon_id + form_id + mega_id + costume_id + '.png');

        } else if (WDR.ICONS.pokemon.includes(Object.pokemon_id + form_id + costume_id)) {
            return (WDR.Config.ICONS_URL + '/pokemon/' + Object.pokemon_id + form_id + costume_id + '.png');

        } else if (WDR.ICONS.pokemon.includes(Object.pokemon_id + mega_id)) {
            return (WDR.Config.ICONS_URL + '/pokemon/' + Object.pokemon_id + mega_id + '.png');

        } else if (WDR.ICONS.pokemon.includes(Object.pokemon_id + form_id)) {
            return (WDR.Config.ICONS_URL + '/pokemon/' + Object.pokemon_id + form_id + '.png');

        } else if (WDR.ICONS.pokemon.includes(Object.pokemon_id)) {
            return (WDR.Config.ICONS_URL + '/pokemon/' + sprite + '.png');

        } else {
            WDR.Console.error(WDR, `[Get_Sprite.js] No Sprite found for Pokemon: ${Object.pokemon_id + form_id + mega_id + costume_id + gender_id}`);
            return null;
        }

    } else if (Object.rewards && Object.rewards.length > 0) {
            
        switch (Object.rewards[0].type) {

            case 2:
                if(Object.rewards[0].info.amount){
                    sprite = WDR.Config.ICONS_URL + '/reward/' + Object.rewards[0].type + '-i' + Object.rewards[0].info.item_id + '-a' + Object.rewards[0].info.amount + '.png';
                } else {
                    sprite = WDR.Config.ICONS_URL + '/reward/' + Object.rewards[0].type + '-i' + Object.rewards[0].info.item_id + '.png';
                }
                break;

            case (3 && Object.rewards[0].info.amount):
                sprite = WDR.Config.ICONS_URL + '/reward/' + Object.rewards[0].type + '-a' + Object.rewards[0].info.amount + '.png';
                break;

            case 12:
                console.log(Object);
                sprite = 'https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_mega_energy.png';
                break;

            default:
                sprite = WDR.Config.ICONS_URL + '/reward/' + Object.rewards[0].type + '.png';
        }
    }

    if (sprite == null) {
        console.error('NULL SPRITE ', Object);
    }

    return sprite;
};