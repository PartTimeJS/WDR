//##############################################################################
// Runs every hour on the hour.
//##############################################################################
module.exports = [
  [
    "scannerDB",
    `DELETE FROM
        pokemon
     WHERE
      first_seen_timestamp < UNIX_TIMESTAMP()-86400;`
  ]
];