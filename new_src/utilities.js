'use strict';

const fs = require('fs-extra');

const utilities;

fs.readdir(__dirname + '/utilities', async (err, utils) => {

        utils = utils.filter(f => f.split('.').pop() === 'js');

        await utils.forEach((f) => {

            delete require.cache[require.resolve(__dirname + '/utilities/' + f)];

            utilities[f.slice(0, -3)] = require(__dirname + '/utilities/' + f);

        });
});

module.exports = utilities;