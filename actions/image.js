var async = require('async');
var _ = require('underscore');
var Species = require('../models/species');

exports.uploadDreamWorld = function(wiki, filename, callback){
  Species.allNames('en', function(err, names){

    var url = 'http://static-local.52poke.com/wikipic/DW2/' + filename;
    var index = parseInt(filename), match = filename.split('.')[0].match(/[A-z]+/);
    match = match && match[0];

    var file = ('00' + index).substr(-3) + names[index] + ' Dream';
    match && (file += ' ' + match);
    file += '.png';

    wiki.remoteUpload(file, url, callback);
  });
};

exports.uploadXYSprites = function(wiki, callback){
  async.eachSeries(_.range(650, 719), function(number, next){
    var url = 'http://static-local.52poke.com/wikipic/sprite/xy/pokemon/' + number + '.png';
    wiki.remoteUpload(number + '.png', url, next);
  }, callback);
};