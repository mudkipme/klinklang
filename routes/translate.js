var replacer = require('../models/replacer');

var actions = {
  itemtable: function(text, callback){
    replacer.loadText(['item'], function(err, results){
      if (err) return callback(err);

      var lines = text.split('\n');
      for (var i=0; i<lines.length; i++) {
        var lineData = lines[i].trim().split('|');

        lineData[0] = lineData[0]
          .replace(/itlisth/gi, 'itemtable')
          .replace(/itlistbod/gi, 'itementry')
          .replace(/itlistfoot/gi, 'itemtable/end');
        lines[i] = lineData.join('|');
        lines[i] = replacer.replaceTextSync(lines[i], results);
      }
      callback(null, lines.join('\n'));
    });
  }

  ,catch: function(text, callback){
    replacer.loadText(['pokemon', 'type'], function(err, results){
      if (err) return callback(err);

      var lines = text.split('\n');
      for (var i=0; i<lines.length; i++) {
        var lineData = lines[i].trim().split('|');

        lineData[0] = lineData[0].replace(/catch\//gi, '捕捉/');
        lines[i] = lineData.join('|').replace(/Only One/g, '只有一只');
        lines[i] = replacer.replaceTextSync(lines[i], results);
      }
      callback(null, lines.join('\n'));
    });
  }

  ,trainer: function(text, callback){
    replacer.loadText(['location', 'trainer-type', 'pokemon', 'item'], function(err, results){
      if (err) return callback(err);

      var lines = text.split('\n');
      for (var i=0; i<lines.length; i++) {
        var lineData = lines[i].trim().split('|');

        lineData[0] = lineData[0]
          .replace(/trainerheader/gi, '训练家/header')
          .replace(/trainerentry/gi, '训练家/entry')
          .replace(/trainerdiv/gi, '训练家/div')
          .replace(/trainerfooter/gi, '训练家/footer');

        if (lineData.length > 1) {
          lineData[1] = lineData[1].charAt(0).toUpperCase() + lineData[1].substr(1);
        }
        
        lines[i] = lineData.join('|');
        lines[i] = replacer.replaceTextSync(lines[i], results);
      }
      callback(null, lines.join('\n'));
    });
  }
};


module.exports = function(req, res){
  if (actions[req.body.type]) {
    actions[req.body.type](req.body.source, function(err, result){
      res.json({result: (err && err.message) || result});
    });
  } else {
    res.json({result: ''});
  }
};