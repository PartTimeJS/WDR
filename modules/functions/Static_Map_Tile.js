const StaticMaps = require('staticmaps');
const fs = require('fs');

// CHECK FOR OR CREATE MAP TILES FOR EMBEDS
module.exports = (MAIN, lat, lon, type) => {
  return new Promise(async function(resolve, reject) {
    if(MAIN.config.Map_Tiles == 'ENABLED'){
      let path = MAIN.config.IMAGE_DIR+type+'_tiles/'+lat+','+lon+'.png';
      let url = await MAIN.Short_URL(MAIN, MAIN.config.HOST+type+'_tiles/'+lat+','+lon+'.png');
      if(MAIN.debug.Map_Tiles == 'ENABLED'){
        console.info('[DEBUG] ['+MAIN.Bot_Time(null,'stamp')+'] [Map Tiles] '+path);
        console.info('[DEBUG] ['+MAIN.Bot_Time(null,'stamp')+'] [Map Tiles] '+url);
      }
      if(fs.existsSync(path)){ return resolve(url); }
      else{
        let options = { width: parseInt(MAIN.config.Tile_Width), height: parseInt(MAIN.config.Tile_Height) };
        if(MAIN.config.Tile_Server){ options.tileUrl = MAIN.config.Tile_Server; }
        let zoom = 16, center = [lon,lat], map = new StaticMaps(options);
        let marker = { img: `https://i.imgur.com/OGMRWnh.png`, width: 40, height: 40 };
        if(MAIN.config.Tile_Marker){ marker.img = MAIN.config.Tile_Marker; }
        if(MAIN.config.Spawn_Marker && type == 'pokemon'){ marker.img = MAIN.config.Spawn_Marker; }
        if(MAIN.config.Gym_Marker && type == 'raid'){ marker.img = MAIN.config.Gym_Marker; }
        if(MAIN.config.Stop_Marker && type == 'quest'){ marker.img = MAIN.config.Stop_Marker; }
        marker.coord = [lon,lat]; map.addMarker(marker);
        map.render(center, zoom)
          .then(() => { map.image.save(MAIN.config.IMAGE_DIR+type+'_tiles/'+lat+','+lon+'.png'); })
          .catch(function(err){ console.error('[Static_Map_Tile] ['+MAIN.Bot_Time(null,'stamp')+'] [bot.js] UNABLE TO RENDER MAP TILE.'); return resolve(undefined); })
          .then(() => { if(MAIN.debug.Tiles == 'ENABLED'){ console.log('[Static_Map_Tile] ['+MAIN.Bot_Time(null,'stamp')+'] [bot.js] [Map Tiles] Saved a new map tile to '+type+'_images.');} return resolve(url); })
          .catch(function(err){ console.error('[Static_Map_Tile] ['+MAIN.Bot_Time(null,'stamp')+'] [bot.js] UNABLE TO SAVE MAP TILE.'); return resolve(undefined); });
      }
    }
    // MAP TILES DISABLED
    else{ return resolve(''); }
  });
}
