var stdin = process.stdin;

function receive(callback) {
  var telephones;

  stdin.resume();
  stdin.on('data', function(chunk) {
      var lines = chunk.toString()
        .split('\n')
        .map(function(it) { return it.trim(); });

      if(lines.length) {
        telephones = lines;
      }
    })
    .on('end', function() {
      if(telephones) {
        callback(telephones);
      }
    });
}

module.exports = receive;
