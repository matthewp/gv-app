#!/usr/bin/env node
var http = require("http"),
		https = require("https"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
		ClientLogin = require("./src/clientlogin.js").ClientLogin,
		sms = require("./src/sms.js"),
    contacts = require("./src/contacts.js"),
    port = process.argv[2] || 8888;

var expressions = [
	{ exp: /\/api\/login/, action: doLogin },
	{ exp: /\/api\/sms/, action: sms.get },
  { exp: /\/api\/contacts/, action: contacts.get }
];

http.createServer(function(request, response) {

  var parsed = url.parse(request.url),
		uri = parsed.pathname,
    filename = path.join(process.cwd(), uri);
  
	var matches = expressions.filter(function(item) {
		return item.exp.test(uri);
	});
	if(matches !== null && matches.length > 0) {
		matches[0].action(request, response, parsed);
		return;
	}

  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

	if (fs.statSync(filename).isDirectory()) filename += 'gv.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      fs.stat(filename, function(err, stats) {
        if(typeof stats !== "undefined" && stats !== null) {
          response.setHeader("Last-Modified", stats.mtime);
          response.writeHead(200);
          if(request.method !== "HEAD")
            response.write(file, "binary");
          response.end();
        }
      });
    });
  });
}).listen(parseInt(port, 10));

function doLogin(req, resp, url) {
	if(!req.body) {
		var body = '';
		req.on('data', function(data) {
			body += data;
		});
		req.on('end', function() {
			req.body = body;
			doLogin(req, resp);
		});

		return;
	}

	var info = JSON.parse(req.body);
  var service = 'grandcentral';
  var retInfo = {};
  retInfo.email = info.email;
  var runs = 0;
  var login = function() {
    var cl = new ClientLogin(info.email, info.password, service, 'HOSTED_OR_GOOGLE');
    cl.authorize(function(sid, lsid, auth) {
      runs++;
      retInfo[service] = auth;

      if(runs === 2) {
        resp.writeHead(200);
        resp.write(JSON.stringify(retInfo));
        resp.end();

        return;
      }

      service = 'cp';
      login();

      return;
    });
  };
  login();
}

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
