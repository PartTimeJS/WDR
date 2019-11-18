const InsideGeojson = require('point-in-geopolygon');

module.exports = (MAIN, lat, lon, discord) => {
  return new Promise(async function(resolve, reject) {
    if(InsideGeojson.polygon(discord.geofence, [lon,lat])){

      // DEFINE AREAS FROM GEOFENCE FILE
      let area = {}
      if(discord.geojson_file){
        let geofence = await MAIN.Geofences.get(discord.geojson_file);
        await geofence.features.forEach((geo,index) => {
          if(InsideGeojson.feature({features:[geo]}, [lon,lat]) != -1){
            switch(geo.properties.sub_area){
              case 'true': area.sub = geo.properties.name;
              break;
              default: area.main = geo.properties.name;
            }
          }
        });
      }
      // ASSIGN AREA TO VARIABLES
      if(area.sub){ area.embed = area.sub; }
      if(area.main && !area.sub){ area.embed = area.main; }
      if(!area.sub && !area.main){ area.embed = discord.name; }

      return resolve(area);
    }
    return reject('Searched location not in your discords.json or geofence file');
  });
}
