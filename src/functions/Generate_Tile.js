/* eslint-disable no-async-promise-executor */
module.exports = (WDR, object, type, lat, lon, url, url2, zoom) => {
    return new Promise(async resolve => {

        if (WDR.Config.TILE_PROVIDER == 'none') {
            return resolve('');
        }

        let stops = '',
            gyms = '',
            post_url = '';

        if (type != 'location') {
            zoom = 15;
            //stops = await WDR.Fetch_Stops(WDR, lat, lon);
            //Sgyms = await WDR.Fetch_Gyms(WDR, lat, lon);
        }

        if (!url2) {
            url2 = 'https://raw.githubusercontent.com/PartTimeJS/Assets/master/map/circle_geofence/point.png';
        }

        if (!WDR.Config.TILE_PROVIDER || WDR.Config.TILE_PROVIDER == 'flo') {
            post_url = WDR.Config.STATIC_MAP_URL + 'staticmap/' + type + '/?&pregenerate=true&regeneratable=true';
        } else {
            post_url = WDR.Config.STATIC_MAP_URL + 'staticmap/' + type + '.json';
        }
        //stops: stops,
        //gyms: gyms
        WDR.Axios.post(post_url, {
            url: url,
            url2: url2,
            lat: lat,
            lon: lon,
            zoom: zoom,
        }).then((res) => {
            return resolve(res.data);
        }).catch(function (error) {
            WDR.Console.error(WDR, '[Generate_Tile.js] [Attempt#1] Error Generating Tile. ' + error.response.status + ' - ' + error.response.statusText);
            if(WDR.Config.DEBUG.Map_Tiles == 'ENABLED'){
                console.error(error);
            }
            if (error.response) {
                if (url == undefined) {
                    if(WDR.Config.DEBUG.Map_Tiles == 'ENABLED'){
                        console.error('[OBJECT] ', object);
                        console.log('[SPRITE URL] ', sprite);
                    }
                    let sprite = WDR.Get_Sprite(WDR, object);         
                }
                setTimeout(() => {
                    WDR.Axios.post(post_url, {
                        url: url,
                        url2: url2,
                        lat: lat,
                        lon: lon,
                        zoom: zoom,
                        stops: stops,
                        gyms: gyms
                    }).then((res) => {
                        return resolve(res.data);
                    }).catch(function (error) {
                        if(WDR.Config.DEBUG.Map_Tiles == 'ENABLED'){
                            WDR.Console.error(WDR, '[Generate_Tile] [Attempt#2] Error Generating Tile. ' + error.response.status + ' - ' + error.response.statusText);
                        }
                    });
                }, 30000);
            }
            return resolve('');
        });
    });
};