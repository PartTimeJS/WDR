// DETERMINE COLOR FOR EMBED
module.exports = (MAIN, type, color) => {
  if(!color){
    switch (type.toLowerCase()) {
      case 'fairy': color = 'e898e8'; break;
      case 'ghost': color = '705898'; break;
      case 'grass': color = '78c850'; break;
      case 'water': color = '6890f0'; break;
      case 'bug': color = 'a8b820'; break;
      case 'fighting': color = 'c03028'; break;
      case 'electric': color = 'f8d030'; break;
      case 'rock': color = 'b8a038'; break;
      case 'fire': color = 'f08030'; break;
      case 'flying': color = 'a890f0'; break;
      case 'ice': color = '98d8d8'; break;
      case 'ground': color = 'e0c068'; break;
      case 'steel': color = 'b8b8d0'; break;
      case 'dragon': color = '7038f8'; break;
      case 'poison': color = 'a040a0'; break;
      case 'psychic': color = 'f85888'; break;
      case 'dark': color = '705848'; break;
      case 'normal': color = '8a8a59'; break;
      default: color = '232b2b';
    }
  }
  return color;
}
