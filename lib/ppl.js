var stdin = process.stdin;

function pipe(callback) {
  var telephone;

  stdin.resume();
  stdin.on('data', function(chunk) {
      var lines = chunk.toString()
        .split('\n')
        .filter(function(line) {
          return line.indexOf('Telephone') !== -1;
        });

      if(lines.length > 0) {
        telephone = lines[0].split('Telephone')[1].trim();
      }
    })
    .on('end', function() {
      callback(telephone);
    });
}

exports.pipe = pipe;
