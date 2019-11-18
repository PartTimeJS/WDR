module.exports = async (MAIN, object, server) => {
  return new Promise(async function(resolve, reject) {
    let locale = {
      pokemon_name: '',
      form: '',

      move_1: '',
      move_2: '',

    }

    // GET DEFAULT FORM NUMBER IF A PROPER FORM ISN'T PASSED
    if(object.pokemon_id && MAIN.masterfile.pokemon[object.pokemon_id]){
      if(!object.form && MAIN.masterfile.pokemon[object.pokemon_id].default_form){
        object.form = MAIN.masterfile.pokemon[object.pokemon_id].default_form;
      }
    }
    // POKEMON NAME AND FORM
    if(object.pokemon_id){ locale.pokemon_name = MAIN.masterfile.pokemon[object.pokemon_id].name; }
    if(object.form && object.form > 0){
      if(!MAIN.masterfile.pokemon[object.pokemon_id].forms[object.form]){
        console.error('[masterfile.json] Missing form info for ('+object.pokemon_id+')'+' Form:'+object.form);
        locale.form = '[Unknown] ';
      }
      else{ locale.form = '['+MAIN.masterfile.pokemon[object.pokemon_id].forms[object.form].name+'] '; }
    }
    // MOVE NAMES
    if(object.move_1){
      if(MAIN.masterfile.moves[object.move_1]){
        locale.move_1 = MAIN.masterfile.moves[object.move_1].name;
      }else{
        console.error('[masterfile.json] Missing move info for move('+object.move_1+')');
        locale.move_1 = object.move_1;
      }
    }
    if(object.move_2){
      if(MAIN.masterfile.moves[object.move_2]){
        locale.move_2 = MAIN.masterfile.moves[object.move_2].name;
      }else{
        console.error('[masterfile.json] Missing move info for move('+object.move_2+')');
        locale.move_2 = object.move_2;
      }
    }
    // IF LURE NAME
    if(object.lure_id){ locale.lure_type = MAIN.Get_Lure(MAIN, object.lure_id); }

    return resolve(locale);
  });
}
