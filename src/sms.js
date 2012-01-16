var sms, http, https, querystring;
http = require('http');
https = require('https');
querystring = require('querystring');

exports.get = function(req, resp) {
	if(!req.body) {
		var body = '';
		req.on('data', function(data) {
			body += data;
		});
		req.on('end', function() {
			req.body = body;
			exports.get(req, resp);
		});

		return;
	}

	var auth = req.body;

	doGet(1, auth, function(data) {
		resp.writeHead(200);
		resp.write(data);
		resp.end();
	});
};

function doGet(page, auth, callback) {
	var options = {
		host: 'www.google.com',
		path: '/voice/b/0/inbox/recent/sms/',
    headers: {
      'Authorization': 'GoogleLogin auth=' + auth
    }
	};

	req = https.get(options, function(r) {
		var data = '';

		r.setEncoding('utf-8');
		r.on('data', function(chunk) {
			data += chunk;
		});
		r.on('end', function() {
			callback(data);
		});
	});
}
