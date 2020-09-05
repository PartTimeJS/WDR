module.exports = (WDR, object) => {
  return new Promise(async resolve => {

    let geofences = await WDR.Geofences.get(object.discord.geojson_file).features;

    if (!geofences) {
      WDR.Console.error(WDR, "[Get_Area.js] Geofence configs/geofences/" + object.discord.geojson_file + " does not appear to exist.");
    } else {
      for (let g = 0, glen = geofences.length; g < glen; g++) {
        let geojson = geofences[g];

        if (WDR.PointInGeoJSON.feature({
            features: [geojson]
          }, [object.longitude, object.latitude]) != -1) {
          if (geojson.properties.sub_area == "true") {
            object.area.sub = geojson.properties.name;
          } else {
            object.area.main = geojson.properties.name;
          }
        }
      }
      return resolve(object.area);
    }
  });
}