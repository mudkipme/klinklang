var convert = function(scss, callback){
  var cp = require('child_process').spawn('sass', [
    '--scss'
    ,'--style', 'compact'
  ]);

  var result = '', error = '';

  cp.on('exit', function(){
    if (error) {
      callback(new Error(error), result);
    } else {
      callback(null, result);
    }
  });

  cp.stdout.setEncoding('utf8');
  cp.stdout.on('data', function(data){
    result += new Buffer(data).toString('utf8');
  });

  cp.stderr.setEncoding('utf8');
  cp.stderr.on('data', function(data){
    error += new Buffer(data).toString('utf8');
  });

  cp.stdin.setEncoding('utf8');
  cp.stdin.write(scss);
  cp.stdin.end();
};

module.exports = function(req, res){
  convert(req.body.text || '', function(err, result){
    res.json({result: (err && err.message) || result.split('\n\n').join('\n')});
  });
};