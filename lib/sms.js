var http = require('http'),
    https = require('https'),
    parser = require ('./parser.js');

function doGet(page, auth, callback) {
  var options = {
    host: 'www.google.com',
    path: '/voice/b/0/inbox/recent/sms/',
    headers: {
      'Authorization': 'GoogleLogin auth=' + auth
    }
  };

  var req = https.get(options, function(r) {
    var data = '';

    r.setEncoding('utf-8');
    r.on('data', function(chunk) {
      data += chunk;
    });
    r.on('end', function() {
      parser(data, function(result) {
        callback(result);
      });
    });
  });
}

exports.get = doGet;
