module.exports = (num) => {
  return new Promise(async resolve => {
    switch (num) {
      case 1:
        return resolve("Male");
        break;
      case 2:
        return resolve("Female");
      default:
        return resolve(null);
    }
  });
}