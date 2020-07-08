// DETERMINE COLOR FOR EMBED
module.exports = (type) => {
  return new Promise(async resolve => {
    switch (type.toLowerCase()) {
      case "fairy":
        return resolve("e898e8");
      case "ghost":
        return resolve("705898");
      case "grass":
        return resolve("78c850");
      case "water":
        return resolve("6890f0");
      case "bug":
        return resolve("a8b820");
      case "fighting":
        return resolve("c03028");
      case "electric":
        return resolve("f8d030");
      case "rock":
        return resolve("b8a038");
      case "fire":
        return resolve("f08030");
      case "flying":
        return resolve("a890f0");
      case "ice":
        return resolve("98d8d8");
      case "ground":
        return resolve("e0c068");
      case "steel":
        return resolve("b8b8d0");
      case "dragon":
        return resolve("7038f8");
      case "poison":
        return resolve("a040a0");
      case "psychic":
        return resolve("f85888");
      case "dark":
        return resolve("705848");
      case "normal":
        return resolve("8a8a59");
      default:
        return resolve("232b2b");
    }
  });
}