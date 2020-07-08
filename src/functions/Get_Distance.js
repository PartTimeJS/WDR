module.exports = (WDR, coords) => {
  return new Promise(async resolve => {
    let coords = User.loc_coords.split(",")[0]
    let spawn_loc = {
      lat: coords.lat1,
      lon: coords.lon1
    };
    let user_loc = {
      lat: coords.lat2,
      lon: coords.lon2
    }
    let spawn_distance = WDR.Distance.between(spawn_loc, user_loc);
    return resolve(spawn_distance);
  });
}