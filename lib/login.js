var voicejs = require('voice.js');

function login(config) {
  var client = new voicejs.Client({
    email: config.email,
    password: config.password
  });

  return client;
}

module.exports = login;
