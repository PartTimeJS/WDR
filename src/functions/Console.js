module.exports = {
  error: function(err, object) {
    console.log((err).bold.brightRed);
    if (object) {
      console.error(object);
    }
    return;
  },

  log: function(log, object) {
    console.log((err).bold.brightRed);
    if (object) {
      console.log(object);
    }
    return;
  },

  info: function(color, text, object) {
    console.log((err).bold[color]);
    if (object) {
      console.log(object);
    }
    return;
  },
}