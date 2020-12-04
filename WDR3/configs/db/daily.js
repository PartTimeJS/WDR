//##############################################################################
// Runs at 11:50pm Local Time.
//
// Example Query Object:
//
//  [
//    "scannerDB", // DB you want to target (scannerDB, wdrDB, or pmsfDB)
//    `DELETE FROM
//        pokemon
//     WHERE
//        first_seen_timestamp < UNIX_TIMESTAMP()-86400;`
//  ],
//
//##############################################################################

module.exports = [
    //----------------------------------------------------------------------------
    [
        "scannerDB",
        `UPDATE
            gym
        INNER JOIN
            pokestop
        ON
            gym.id = pokestop.id
        SET
            gym.name = pokestop.name,
            gym.url = pokestop.url
        WHERE
            gym.id = pokestop.id;`
    ],
    // TLH ----------------------------------------------------------------------------
    [
        "scannerDB",
        `UPDATE
            pokestop
        SET
            zone = 1
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                30.017645 -84.691264,
                31.009506 -84.657775,
                31.002577 -83.847108,
                30.065628 -84.283621,
                30.017645 -84.691264 
            ))'), point(pokestop.lat, pokestop.lon));`
    ],
    [
        "scannerDB",
        `UPDATE
            spawnpoint
        SET
            zone = 1
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                30.017645 -84.691264,
                31.009506 -84.657775,
                31.002577 -83.847108,
                30.065628 -84.283621,
                30.017645 -84.691264
            ))'), point(spawnpoint.lat, spawnpoint.lon));`
    ],
    // GVL ----------------------------------------------------------------------------
    [
        "scannerDB",
        `UPDATE
        pokestop
        SET
            zone = 2
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                29.494597 -82.169495,
                29.835879 -82.180481,
                29.828731 -82.611694,
                29.496988 -82.584229,
                29.494597 -82.169495
            ))'), point(pokestop.lat, pokestop.lon));`
    ],
    [
        "scannerDB",
        `UPDATE
            spawnpoint
        SET
            zone = 2
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                29.494597 -82.169495,
                29.835879 -82.180481,
                29.828731 -82.611694,
                29.496988 -82.584229,
                29.494597 -82.169495
            ))'), point(spawnpoint.lat, spawnpoint.lon));`
    ],
    // COL ----------------------------------------------------------------------------
    [
        "scannerDB",
        `UPDATE
            pokestop
        SET
            zone = 3
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                32.261588 -84.644165,
                32.653251 -84.652405,
                32.648626 -85.113831,
                32.268555 -85.119324,
                32.261588 -84.644165
            ))'), point(pokestop.lat, pokestop.lon));`
    ],
    [
        "scannerDB",
        `UPDATE
            spawnpoint
        SET
            zone = 3
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                32.261588 -84.644165,
                32.653251 -84.652405,
                32.648626 -85.113831,
                32.268555 -85.119324,
                32.261588 -84.644165
            ))'), point(spawnpoint.lat, spawnpoint.lon));`
    ],
    // MGM ----------------------------------------------------------------------------
    [
        "scannerDB",
        `UPDATE
            pokestop
        SET
            zone = 4
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                32.261588 -86.028442,
                32.616243 -86.031189,
                32.616243 -86.585999,
                32.208153 -86.569519,
                32.261588 -86.028442
            ))'), point(pokestop.lat, pokestop.lon));`
    ],
    [
        "scannerDB",
        `UPDATE
            spawnpoint
        SET
            zone = 4
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                32.261588 -86.028442,
                32.616243 -86.031189,
                32.616243 -86.585999,
                32.208153 -86.569519,
                32.261588 -86.028442
            ))'), point(spawnpoint.lat, spawnpoint.lon));`
    ],
    // MEM ----------------------------------------------------------------------------
    [
        "scannerDB",
        `UPDATE
            pokestop
        SET
            zone = 5
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                34.766435 -89.480896,
                35.453958 -89.500122,
                35.46067 -90.318604,
                34.748383 -90.302124,
                34.766435 -89.480896
            ))'), point(pokestop.lat, pokestop.lon));`
    ],
    [
        "scannerDB",
        `UPDATE
            spawnpoint
        SET
            zone = 5
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                34.766435 -89.480896,
                35.453958 -89.500122,
                35.46067 -90.318604,
                34.748383 -90.302124,
                34.766435 -89.480896
            ))'), point(spawnpoint.lat, spawnpoint.lon));`
    ],
    // OKC ----------------------------------------------------------------------------
    [
        "scannerDB",
        `UPDATE
            pokestop
        SET
            zone = 6
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                35.069805 -96.942404,
                35.814879 -96.935872,
                35.8215 -97.884719,
                35.076487 -97.858589,
                35.069805 -96.942404
            ))'), point(pokestop.lat, pokestop.lon));`
    ],
    [
        "scannerDB",
        `UPDATE
            spawnpoint
        SET
            zone = 6
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                35.069805 -96.942404,
                35.814879 -96.935872,
                35.8215 -97.884719,
                35.076487 -97.858589,
                35.069805 -96.942404
            ))'), point(spawnpoint.lat, spawnpoint.lon));`
    ],
    // ABQ ----------------------------------------------------------------------------
    [
        "scannerDB",
        `UPDATE
            pokestop
        SET
            zone = 7
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                35.432559 -106.922446,
                35.435220 -106.257763,
                34.893848 -106.233266,
                34.902554 -106.923263,
                35.432559 -106.922446
            ))'), point(pokestop.lat, pokestop.lon));`
    ],
    [
        "scannerDB",
        `UPDATE
            spawnpoint
        SET
            zone = 7
        WHERE
            zone is NULL
        AND
            ST_CONTAINS(ST_GEOMFROMTEXT('POLYGON((
                35.432559 -106.922446,
                35.435220 -106.257763,
                34.893848 -106.233266,
                34.902554 -106.923263,
                35.432559 -106.922446
            ))'), point(spawnpoint.lat, spawnpoint.lon));`
    ],
    //----------------------------------------------------------------------------
    [
        "scannerDB",
        `DELETE FROM
            pokestop
        WHERE
            id
        IN
            (SELECT id FROM gym);`,
    ],
    //----------------------------------------------------------------------------
    [
        "scannerDB",
        `DELETE FROM
            pokestop
        WHERE
        updated < UNIX_TIMESTAMP()-172800;`
    ],
    //----------------------------------------------------------------------------
    [
        "scannerDB",
        `DELETE FROM
            gym
        WHERE
        updated < UNIX_TIMESTAMP()-172800;`
    ],
    //----------------------------------------------------------------------------
    [
        "scannerDB",
        `DELETE FROM
            grafana_devices
        WHERE
        timestamp < UNIX_TIMESTAMP()-604800;`
    ],
    //----------------------------------------------------------------------------
    [
        "scannerDB",
        `DELETE FROM
            pokestop
        WHERE
            zone = NULL;`,
    ],
    //----------------------------------------------------------------------------
    [
        "scannerDB",
        `DELETE FROM
            spawnpoint
        WHERE
            zone is NULL;`
    ]
];