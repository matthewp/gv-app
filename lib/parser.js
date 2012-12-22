var xml = require('node-xml');

function parse(data, callback) {
  var parser = new xml.SaxParser(function(cb) {
    var result, isJson = false;

    cb.onEndDocument(function() {
      result = '';
    });

    cb.onEndDocument(function() {
      result = JSON.parse(result);
      
      callback(result);
    });

    cb.onStartElementNS(function(elem) {
      isJson = elem === 'json'
    });

    cb.onCdata(function(cdata) {
      if(isJson) {
        result = cdata;
      }
    });
  });

  parser.parseString(data);
}

module.exports = parse;
