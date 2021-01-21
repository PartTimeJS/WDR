module.exports = (WDR, coords) => {
    return new Promise(resolve => {
        let spawn_loc = {
            lat: coords.lat1,
            lon: coords.lon1
        };
        let user_loc = {
            lat: coords.lat2,
            lon: coords.lon2
        };
        let spawn_distance = WDR.Distance.between(spawn_loc, user_loc);
        return resolve(spawn_distance);
    });
};