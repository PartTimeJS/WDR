module.exports = (MAIN, encounter) => {
  // CHECK FOR DITTO
  const possibleDittos = [13,46,48,163,165,167,187,223,273,293,300,316,322,399];
  switch (true) {
    case encounter.cp == null:
    case encounter.weather <= 0:
    case possibleDittos.indexOf(encounter.pokemon_id) < 0:
      return encounter;
    default:
      switch (true) {
        case encounter.pokemon_level < 6:
        case encounter.individual_attack < 4:
        case encounter.individual_defense < 4:
        case encounter.individual_stamina < 4:
          encounter.disguise = encounter.pokemon_id;
          encounter.pokemon_id = 132;
          encounter.gender = 3;
          encounter.form = 0;
          encounter.move_1 = 242;
          encounter.move_2 = 133;
          if(MAIN.debug.Ditto && MAIN.debug.Ditto == 'ENABLED'){
            console.log('[bot.js] ['+MAIN.Bot_Time(null,'stamp')+'] Ditto Seen '+encounter.disguise);
          }
          return encounter;
        default:
          return encounter;
      }
  }
}
