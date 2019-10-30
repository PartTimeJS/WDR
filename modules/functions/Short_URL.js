const request = require('request');

module.exports = (MAIN, url) => {
  return new Promise(resolve => {
    // COMPLETELY OPTIONAL SHORTURLS
    if(!MAIN.config.SHORTURL){ return resolve(url); }
    
    else {
      // DECLARE VARIABLES
      let signature = MAIN.config.SHORTURL.signature;
      let domain = MAIN.config.SHORTURL.domain;
      var uri = 'http://'+domain+'/yourls-api.php?signature='+signature+'&action=shorturl&url='+url+'&format=json';

      request(uri, function(err, res, body){
        switch (true) {
          // CATCH ERRORS AND EMPTY BODYS
          case err:
            console.error('[FUNCTIONS] ['+MAIN.Bot_Time(null,'stamp')+'] [Short_URL] Problem with request.');
            return resolve(url);
          case !body: return resolve(url);
          case body.charAt(0) == '<': return resolve(url);
          default:
            // PARSE JSON RESPONSE
            var response = {};
            try {
              response = JSON.parse(body);
            } catch(e) {
              response.statusCode = e;
            }

            if(response.statusCode == '200'){
              return resolve(response.shorturl);
            } else{
              console.error(response.statusCode);
              return resolve(url);
            }
        }
      });
    }
  })
}
