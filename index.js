var ClientLogin = require('./lib/clientlogin.js').ClientLogin,
    sms = require('./lib/sms.js'),
    fs = require('fs'),
    ini = require('ini'),
    program = require('commander');

program.version('0.1.0')
  .option('list', 'List messages')
  .option('contacts', 'List your contacts')
  .option('sms [contact] [message]', 'Send an sms to a contact')
  .parse(process.argv);

function init(callback) {
  var configFile = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] + '/.gvrc';
  var config;
  if(fs.exists(configFile)) {
    config = ini.parse(fs.readFileSync(configFile, 'utf-8'));
    callback(config);
  } else {
    config = Object.create(null);

    program.prompt('Email: ', function(email) {
      program.password('Password: ', function(password) {
       config.email = email;
       config.password = password;

       fs.writeFileSync(configFile, ini.stringify(config));
       callback(config);
      });
    });
  }
}

init(function(config) {
  console.log(typeof config);
});

//var clientLogin = new ClientLogin(email, password, 'grandcentral', 'HOSTED_OR_GOOGLE');

var log = console.log.bind(console);

/*
clientLogin.authorize(function(sid, lsid, auth) {

  sms.get(1, auth, log);
    
  
});
*/
