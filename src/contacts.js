var http, https, querystring;
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

	var info = JSON.parse(req.body);

	doGet(info.email, info.auth, info.page, function(data) {
		resp.writeHead(200);
		resp.write(data);
		resp.end();
	});
};

function doGet(email, auth, page, callback) {
	var path = page === 1 ? '/m8/feeds/contacts/' + email + '/full'
		: '/m8/feeds/contacts/' + email + '/full' + '?start-index=' +
			((page - 1) * 25).toString();
	console.log(path);
	var options = {
		host: 'www.google.com',
		path: path,
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
