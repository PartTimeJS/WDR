module.exports = (MAIN, sighting) => {
  return new Promise(function(resolve) {
    if(MAIN.debug.Pokemon_Timers == 'ENABLED'){ console.log("ATTEMPTING TO VERIFY DESPAWN ON: "+pokemon.name+" WITH POKEMON ID: "+sighting.encounter_id); }
    MAIN.rdmdb.query("SELECT * FROM pokemon WHERE id = ?",sighting.encounter_id, function(error, rows, fields) {
      if(error){
        if(MAIN.debug.Pokemon_Timers == 'ENABLED') { console.log("QUERY TO REVERIFY POKEMON TIMER FAILED"); }
        return resolve(sighting);
      } else if(rows && rows[0]){
        sighting.disappear_time_verified = rows[0].expire_timestamp_verified;
        sighting.disappear_time = rows[0].expire_timestamp;
        if(MAIN.debug.Pokemon_Timers == 'ENABLED') { console.log("SUCCESSFULLY QUERIED DATABASE FOR UP TO DATE INFO"); }
        return resolve(sighting);
      } else{
        if(MAIN.debug.Pokemon_Timers == 'ENABLED') { console.log("UNABLE TO FIND POKEMON IN DATABASE WITH ID: "+sighting.encounter_id); }
        return resolve(sighting);
      }
    });
  });
}
