module.exports = async (WDR, Object) => {
  return new Promise(async resolve => {
    // GET WEATHER BOOST
    switch (Object.weather) {
      case 1:
        return resolve(WDR.Emotes.clear);
      case 2:
        return resolve(WDR.Emotes.rain);
      case 3:
        return resolve(WDR.Emotes.partlyCloudy);
      case 4:
        return resolve(WDR.Emotes.cloudy);
      case 5:
        return resolve(WDR.Emotes.windy);
      case 6:
        return resolve(WDR.Emotes.snow);
      case 7:
        return resolve(WDR.Emotes.fog);
      default:
        return resolve("");
    }
  });
}