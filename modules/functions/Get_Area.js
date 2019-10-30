const InsideGeojson = require('point-in-geopolygon');

module.exports = (MAIN, lat, lon, discord) => {
  return new Promise(async function(resolve, reject) {
    if(InsideGeojson.polygon(discord.geofence, [lon,lat])){

      // DEFINE AREAS FROM GEOFENCE FILE
      let main_area = '', sub_area = '', embed_area = '';
      if(discord.geojson_file){
        let geofence = await MAIN.Geofences.get(discord.geojson_file);
        await geofence.features.forEach((geo,index) => {
          if(InsideGeojson.feature({features:[geo]}, [lon,lat]) != -1){
            switch(geo.properties.sub_area){
              case 'true': sub_area = geo.properties.name;
              break;
              default: main_area = geo.properties.name;
            }
          }
        });
      }
      // ASSIGN AREA TO VARIABLES
      if(sub_area){ embed_area = sub_area; }
      if(main_area && !sub_area){ embed_area = main_area; }
      if(!sub_area && !main_area){ embed_area = discord.name; }

      return resolve({ embed_area: embed_area, sub_area: sub_area, main_area: main_area });
    }
    return reject('Searched location not in your discords.json or geofence file');
  });
}
