module.exports = (MAIN, pokemon_id) => {
  switch (true) {
    case pokemon_id <= 151: return 'Gen1';
    case pokemon_id <= 251: return 'Gen2';
    case pokemon_id <= 386: return 'Gen3';
    case pokemon_id <= 493: return 'Gen4';
    case pokemon_id <= 649: return 'Gen5';
    case pokemon_id <= 721: return 'Gen6';
    case pokemon_id <= 809: return 'Gen7';
    default: return 'Gen8';
  }
}
