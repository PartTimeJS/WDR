module.exports = async (WDR, pokemonID, formID, attack, defense, stamina, level) => {
    let CP = 0;
    let pokemonAttack = 0,
        pokemonDefense = 0,
        pokemonStamina = 0;
    let CPMultiplier = WDR.cp_multiplier[level];

    if (!WDR.Master.Pokemon[pokemonID]) {
        return WDR.Console.error('[src/pvp.js] Can\'t find Pokemon ID: ' + pokemonID + ' Form:' + formID);
    }
    if (!WDR.Master.Pokemon[pokemonID].attack) {
        if (!WDR.Master.Pokemon[pokemonID].forms[formID] || !WDR.Master.Pokemon[pokemonID].forms[formID].attack) {
            return WDR.Console.error('[src/pvp.js] Can\'t find attack of Pokemon ID: ' + pokemonID + ' Form:' + formID);
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
        CP = 10;
    }

    return CP;
};