// OBTAIN POKEMON SPRITE
module.exports = (MAIN, pokemon, quest) => {
  return new Promise(async function(resolve, reject) {
    let sprite_url = MAIN.config.SPRITE_URL;
    let sprite_type = quest ? 'QUEST' : MAIN.config.SPRITE_TYPE;
    let extension = '';
    switch (sprite_type) {
      case 'QUEST':
        // GET QUEST REWARD ICON
          let questUrl = '';
          MAIN.rewards.array.forEach((reward,index) => {
            if(pokemon.indexOf(reward.name) >= 0){ questUrl = reward.url; }
          }); return resolve(questUrl);
      // SHUFFLE ICONS
      case 'SHUFFLE':
      case 'DERP':
        if (pokemon.form > 0 ){
          extension = '_'+pokemon.form+extension;
        } else { extension = '_00'+extension; }
        if (pokemon.costume && pokemon.costume > 0){
          extension = extension+'_'+pokemon.costume;
        }
        sprite_url = sprite_url+'pokemon_icon_';
        break;
      // ASSET ICONS
      case 'ASSETS':
        if (pokemon.form > 0 ){
          if(MAIN.masterfile.pokemon[pokemon.pokemon_id].forms[pokemon.form] && MAIN.masterfile.pokemon[pokemon.pokemon_id].forms[pokemon.form].asset_form){
            extension = '_'+MAIN.masterfile.pokemon[pokemon.pokemon_id].forms[pokemon.form].asset_form;
          } else { extension = '_00'+extension; }
        } else { extension = '_00'+extension; }
        if (pokemon.costume && pokemon.costume > 0){
          if(pokemon.costume < 10) { extension = extension+'_0'+pokemon.costume; }
          else { extension = extension+'_'+pokemon.costume; }
        }
        sprite_url = sprite_url+'pokemon_icon_';
        break;
      // SEREBII ICONS
      default:
        if(pokemon.form > 0 ){
          if(!MAIN.masterfile.pokemon[pokemon.pokemon_id].forms[pokemon.form]){console.log('Error finding pokemon with form '+pokemon.pokemon_id+' '+pokemon.form);}
          switch (MAIN.masterfile.pokemon[pokemon.pokemon_id].forms[pokemon.form].name) {
            case 'Alolan': extension = '-a'+extension; break;
            case 'Origin': extension = '-o'+extension; break;
            case 'Sandy': extension = '-c'+extension; break;
            case 'Trash': extension = '-s'+extension; break;
            default: extension = extension;
          }
        }
    }
    extension += '.png';
    sprite_url =  sprite_url+pad(pokemon.pokemon_id,3)+extension;

    return resolve(sprite_url);
  })
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
