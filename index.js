var ClientLogin = require('./lib/clientlogin.js').ClientLogin,
    sms = require('./lib/sms.js'),
    fs = require('fs'),
    ini = require('ini');

var configFile = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] + '/.gvrc';
var config = ini.parse(fs.readFileSync(configFile, 'utf-8'));

//var clientLogin = new ClientLogin(email, password, 'grandcentral', 'HOSTED_OR_GOOGLE');

var log = console.log.bind(console);

log(configFile);
log(typeof config);
log(typeof config.email);

/*
clientLogin.authorize(function(sid, lsid, auth) {

  sms.get(1, auth, log);
    
  
});
*/
