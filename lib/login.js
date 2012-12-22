var ClientLogin = require('./clientlogin.js').ClientLogin,
    voicejs = require('voice.js');

function login(config) {
  /*var cl = new ClientLogin(config.email, config.password, 'grandcentral', 'HOSTED_OR_GOOGLE');
  cl.authorize(function(sid, lsid, auth) {
    callback(auth);
  });*/

  var client = new voicejs.Client({
    email: config.email,
    password: config.password
  });

  return client;
}

module.exports = login;
