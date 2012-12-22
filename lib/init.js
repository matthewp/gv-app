var ini = require('ini'),
    fs = require('fs');

function init(program, callback) {
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

module.exports = init;
