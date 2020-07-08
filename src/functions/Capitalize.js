module.exports = async (string) => {
  return new Promise(async resolve => {
    try {
      if (!string) {
        return resolve("");
      } else if (isNaN(string)) {
        string = string.toLowerCase();
        if (string.split(" ").length > 1) {
          let processed = "";
          string.split(" ").forEach((word) => {
            processed += " " + word.charAt(0).toUpperCase() + word.slice(1);
          });
          return resolve(processed.slice(1));
        } else {
          return resolve(string.charAt(0).toUpperCase() + string.slice(1));
        }
      } else {
        return resolve("");
      }
    } catch (e) {
      console.error(e);
      console.error(string);
    }
  });
}