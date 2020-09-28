module.exports = (WDR, name) => {
  return new Promise(async resolve => {
    let PokemonArray = Object.keys(WDR.Master.Pokemon).map(i => WDR.Master.Pokemon[i].pokedex_id);
    for (let p = 0, plen = PokemonArray.length; p < plen; p++) {
      let pokemon = WDR.Master.Pokemon[PokemonArray[p]];
      if (pokemon.name.toLowerCase() == name.toLowerCase()) {
        let forms = Object.keys(pokemon.forms).map(f => pokemon.forms[f].form);
        if (forms.indexOf("Purified") >= 0) {
          forms.splice(forms.indexOf("Purified"), 1);
        }
        if (forms.indexOf("Shadow") >= 0) {
          forms.splice(forms.indexOf("Shadow"), 1);
        }
        let form_ids = Object.keys(pokemon.forms);
        let data = {
          id: pokemon.pokedex_id,
          name: pokemon.name,
          default_form: pokemon.default_form,
          forms: forms,
          form_ids: form_ids
        };
       return resolve(data);
      }
    }
   return resolve(null);
  });
}