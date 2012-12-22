var ClientLogin = require('./clientlogin.js').ClientLogin;

function login(config, callback, errback) {
  var cl = new ClientLogin(config.email, config.password, 'grandcentral', 'HOSTED_OR_GOOGLE');
  cl.authorize(function(sid, lsid, auth) {
    callback(auth);
  });
}

module.exports = login;
