module.exports = {
  error: function(WDR, err, object) {
    console.log(("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] " + err).bold.brightRed);
    if (object) {
      if (object.length > 1) {
        object.forEach(error => {
          console.error(error);
        });
      } else {
        console.error(object);
      }
    }
    return;
  },

  log: function(WDR, log, object) {
    console.log(("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] " + log).bold.brightGreen);
    if (object) {
      console.log(object);
    }
    return;
  },

  info: function(WDR, info, object) {
    console.info("WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] " + info);
    if (object) {
      console.info(object);
    }
    return;
  },

  custom: function(text, object, color) {

  }
}