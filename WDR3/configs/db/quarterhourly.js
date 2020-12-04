//##############################################################################
// Runs every minute.
//##############################################################################
module.exports = [
  //----------------------------------------------------------------------------
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Pokemon / Hour` = ( SELECT count(*) FROM pokemon WHERE (first_seen_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 30.268556 -84.028931, 30.727671 -84.039917, 30.722949 -84.602966, 30.282788 -84.578247, 30.268556 -84.028931 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Tallahassee, FL';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `IVs / Hour` = ( SELECT count(*) FROM pokemon WHERE iv is NOT NULL AND (expire_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 30.268556 -84.028931, 30.727671 -84.039917, 30.722949 -84.602966, 30.282788 -84.578247, 30.268556 -84.028931 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Tallahassee, FL';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Quest Comp` = ( SELECT ( SELECT count(*) FROM pokestop WHERE quest_reward_type IS NOT NULL AND zone = 1 ) / ( SELECT count(*) FROM pokestop WHERE zone = 1 ) * 100 ) WHERE `City` = 'Tallahassee, FL';"
  ],
  //----------------------------------------------------------------------------
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Pokemon / Hour` = ( SELECT count(*) FROM pokemon WHERE (first_seen_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 29.494597 -82.169495, 29.835879 -82.180481, 29.828731 -82.611694, 29.496988 -82.584229, 29.494597 -82.169495 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Gainesville, FL';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `IVs / Hour` = ( SELECT count(*) FROM pokemon WHERE iv is NOT NULL AND (expire_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 29.494597 -82.169495, 29.835879 -82.180481, 29.828731 -82.611694, 29.496988 -82.584229, 29.494597 -82.169495 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Gainesville, FL';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Quest Comp` = ( SELECT ( SELECT count(*) FROM pokestop WHERE quest_reward_type IS NOT NULL AND zone = 2 ) / ( SELECT count(*) FROM pokestop WHERE zone = 2 ) * 100 ) WHERE `City` = 'Gainesville, FL';"
  ],
  //----------------------------------------------------------------------------
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Pokemon / Hour` = ( SELECT count(*) FROM pokemon WHERE (first_seen_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 32.261588 -84.644165, 32.653251 -84.652405, 32.648626 -85.113831, 32.268555 -85.119324, 32.261588 -84.644165 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Columbus, GA';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `IVs / Hour` = ( SELECT count(*) FROM pokemon WHERE iv is NOT NULL AND (expire_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 32.261588 -84.644165, 32.653251 -84.652405, 32.648626 -85.113831, 32.268555 -85.119324, 32.261588 -84.644165 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Columbus, GA';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Quest Comp` = ( SELECT ( SELECT count(*) FROM pokestop WHERE quest_reward_type IS NOT NULL AND zone = 3 ) / ( SELECT count(*) FROM pokestop WHERE zone = 3 ) * 100 ) WHERE `City` = 'Columbus, GA';"
  ],
  //----------------------------------------------------------------------------
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Pokemon / Hour` = ( SELECT count(*) FROM pokemon WHERE (first_seen_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 32.261588 -86.028442, 32.616243 -86.031189, 32.616243 -86.585999, 32.208153 -86.569519, 32.261588 -86.028442 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Montgomery, AL';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `IVs / Hour` = ( SELECT count(*) FROM pokemon WHERE iv is NOT NULL AND (expire_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 32.261588 -86.028442, 32.616243 -86.031189, 32.616243 -86.585999, 32.208153 -86.569519, 32.261588 -86.028442 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Montgomery, AL';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Quest Comp` = ( SELECT ( SELECT count(*) FROM pokestop WHERE quest_reward_type IS NOT NULL AND zone = 4 ) / ( SELECT count(*) FROM pokestop WHERE zone = 4 ) * 100 ) WHERE `City` = 'Montgomery, AL';"
  ],
  //----------------------------------------------------------------------------
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Pokemon / Hour` = ( SELECT count(*) FROM pokemon WHERE (first_seen_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 34.766435 -89.480896, 35.453958 -89.500122, 35.46067 -90.318604, 34.748383 -90.302124, 34.766435 -89.480896 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Memphis, TN';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `IVs / Hour` = ( SELECT count(*) FROM pokemon WHERE iv is NOT NULL AND (expire_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 34.766435 -89.480896, 35.453958 -89.500122, 35.46067 -90.318604, 34.748383 -90.302124, 34.766435 -89.480896 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Memphis, TN';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Quest Comp` = ( SELECT ( SELECT count(*) FROM pokestop WHERE quest_reward_type IS NOT NULL AND zone = 5 ) / ( SELECT count(*) FROM pokestop WHERE zone = 5 ) * 100 ) WHERE `City` = 'Memphis, TN';"
  ],
  //----------------------------------------------------------------------------
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Pokemon / Hour` = (SELECT count( * ) FROM pokemon WHERE(first_seen_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 35.069805 -96.942404, 35.814879 -96.935872, 35.8215 -97.884719, 35.076487 -97.858589, 35.069805 -96.942404 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Oklahoma City, OK';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `IVs / Hour` = (SELECT count( * ) FROM pokemon WHERE iv is NOT NULL AND(expire_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 35.069805 -96.942404, 35.814879 -96.935872, 35.8215 -97.884719, 35.076487 -97.858589, 35.069805 -96.942404 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Oklahoma City, OK';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Quest Comp` = (SELECT(SELECT count( * ) FROM pokestop WHERE quest_reward_type IS NOT NULL AND zone = 6) / (SELECT count( * ) FROM pokestop WHERE zone = 6) * 100) WHERE `City` = 'Oklahoma City, OK';"
  ],
  //----------------------------------------------------------------------------
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Pokemon / Hour` = (SELECT count( * ) FROM pokemon WHERE(first_seen_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 35.432559 -106.922446, 35.435220 -106.257763, 34.893848 -106.233266, 34.902554 -106.923263, 35.432559 -106.922446 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Albuquerque, NM';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `IVs / Hour` = (SELECT count( * ) FROM pokemon WHERE iv is NOT NULL AND(expire_timestamp > unix_timestamp() - 3600) AND ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON(( 35.432559 -106.922446, 35.435220 -106.257763, 34.893848 -106.233266, 34.902554 -106.923263, 35.432559 -106.922446 ))'), point(pokemon.lat, pokemon.lon)) ) WHERE `City` = 'Albuquerque, NM';"
  ],
  [
    "scannerDB",
    "UPDATE grafana_cities SET `Quest Comp` = (SELECT(SELECT count( * ) FROM pokestop WHERE quest_reward_type IS NOT NULL AND zone = 7) / (SELECT count( * ) FROM pokestop WHERE zone = 7) * 100) WHERE `City` = 'Albuquerque, NM';"
  ]
];