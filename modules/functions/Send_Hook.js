const needle = require('needle');

//REDIRECT WEBHOOK TO A SECOND SOURCE
module.exports = (MAIN, hook_url, hook_body, type) => {
  hook_body = '[{"type": "'+type+'","message":'+hook_body+'}]';
  needle.post(hook_url, hook_body, { content_type: 'application/json' }, function(err, resp) {
  // you can pass params as a string or as an object.
});
return;
}
