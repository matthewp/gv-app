var http = require('http'),
    https = require('https'),
    querystring = require('querystring');

function doSend(number, message, auth, callback) {
  var postData = querystring.stringify({
    phoneNumber: number,
    text: message
  });
 
  var options = {
    host: 'www.google.com',
    path: '/voice/b/0/sms/send',
    method: 'POST',
    headers: {
      'Authorization': 'GoogleLogin auth=' + auth,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      'Content-Length': postData.length.toString()
    }
  };

  console.log(JSON.stringify(postData)); 
  console.log(JSON.stringify(options));

  var req = https.request(options, function(r) {
    var data = '';

    console.log(r.statusCode);
    console.log(r.headers);

    r.setEncoding('utf-8');
    r.on('data', function(chunk) {
      data += chunk;
    });

    r.on('end', function() {
      console.log(data);

      callback();
    });
  });
  req.write(postData);
  req.end();

  req.on('error', function(e) {
    console.error(e);
  });
}

exports.send = doSend;
