var ClientLogin = require('./lib/clientlogin.js').ClientLogin,
    ppl = require('./lib/ppl.js'),
    sms = require('./lib/sms.js'),
    fs = require('fs'),
    ini = require('ini'),
    program = require('commander');

program.version('0.1.0')
  .option('ls', 'List messages')
  .option('ppl', 'List your contacts')
  .option('send [contact] [message]', 'Send an sms to a contact')
  .parse(process.argv);

function init(callback) {
  var configFile = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] + '/.gvrc';

  var config;
  if(fs.existsSync(configFile)) {
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

var log = console.log.bind(console);

init(function(config) {
  var clientLogin = new ClientLogin(config.email, config.password, 'grandcentral', 'HOSTED_OR_GOOGLE');
  clientLogin.authorize(function(sid, lsid, auth) {
    
    if(program.ls) {
      sms.get(1, auth, log);
    } else if(program.ppl) {
      log('Contacts.');
    } else if(program.send) {
      var contact = program.send;
      var message = process.argv.splice(4).join(' ');

      ppl.phone(function(phone) {
        log('Phone number is ' + phone);
      });
    
    } else {
      program.help();
    }

  });
});
