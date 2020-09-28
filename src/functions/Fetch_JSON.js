const fetch = require('node-fetch');

module.exports = async (url) => {
  return new Promise(async resolve => {
    fetch(url)
      .then(res => res.json())
      .then(json => {
       return resolve(json);
      });
  });
}