// DETERMINE COLOR FOR EMBED
module.exports = (type) => {
  switch (type.toLowerCase()) {
    case "fairy":
      return "e898e8";
    case "ghost":
      return "705898";
    case "grass":
      return "78c850";
    case "water":
      return "6890f0";
    case "bug":
      return "a8b820";
    case "fighting":
      return "c03028";
    case "electric":
      return "f8d030";
    case "rock":
      return "b8a038";
    case "fire":
      return "f08030";
    case "flying":
      return "a890f0";
    case "ice":
      return "98d8d8";
    case "ground":
      return "e0c068";
    case "steel":
      return "b8b8d0";
    case "dragon":
      return "7038f8";
    case "poison":
      return "a040a0";
    case "psychic":
      return "f85888";
    case "dark":
      return "705848";
    case "normal":
      return "8a8a59";
    default:
      return "232b2b";
  }
}