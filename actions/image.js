var async = require('async');
var _ = require('underscore');
var Species = require('../models/species');

var uploadDreamWorld = function(wiki, filename, callback){
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

var uploadXYSprites = function(wiki, callback){
  async.eachSeries(_.range(650, 719), function(number, next){
    var url = 'http://static-local.52poke.com/wikipic/sprite/xy/pokemon/' + number + '.png';
    wiki.remoteUpload(number + '.png', url, next);
  }, callback);
};

var uploadMega = function(wiki, filename, callback){
  filename = filename.replace(/\.png$/, '');
  var url = 'http://static-local.52poke.com/wikipic/sprite/xy/mega/' + filename + '.png';
  var filename = filename + 'MS.png';
  wiki.remoteUpload(filename, url, callback);
};

exports.register = function(program, wiki){
  program
  .command('dream-image <filename>')
  .description('Upload the artwork of Dream World.')
  .action(function(filename){
    uploadDreamWorld(wiki, filename, function(err, data){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(data));
    });
  });

  program
  .command('xy-sprites')
  .description('Upload the sprites in Pokémon X & Y.')
  .action(function(filename){
    uploadXYSprites(wiki, function(err, data){
      if (err) return console.log(err.message);
      console.log('Finished.');
    });
  });

  program
  .command('mega-icons <filename>')
  .description('Upload the icons of Mega Pokémon.')
  .action(function(filename){
    uploadMega(wiki, filename, function(err, data){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(data));
    });
  });
};