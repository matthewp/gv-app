var http = require('http'),
    https = require('https'),
    parser = require ('./parser.js');

function doGet(section, page, auth, callback) {
  var options = {
    host: 'www.google.com',
    path: '/voice/b/0/inbox/recent/' + (section || ''),
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
        var msgs = Object.keys(result.messages)
          .map(function(key) {
            return result.messages[key];
          })
          .sort(function(a, b) {
            var c = +a.startTime;
            var d = +b.startTime

            return c > d;
          });

        callback(msgs);
      });
    });
  });
}

exports.get = doGet;
