var fs = require('fs');
var _ = require('underscore');
var csv = require('csv');
var Wiki = require('../models/wiki');

exports.enDex = function(pokemon, callback){
  var wiki = new Wiki({api: 'http://bulbapedia.bulbagarden.net/w/api.php'});

  wiki.getSection(pokemon + ' (Pokémon)', 'Pokédex entries', function(err, content, rvsection){
    if (err) return callback(err);

    wiki.getAttrs(content, 'Dex', function(err, result){
      setTimeout(function(){
        callback(err, result);
      }, 500);
    });
  });
};

exports.analyze = function(entries){
  return _.map(entries, function(entry){
    var result = _.pick(entry, 'xdex', 'ydex', 'xydex');
    var rest = _.omit(entry, 'xdex', 'ydex', 'xydex');

    var xsame = [], ysame = [], xysame = [];
    _.each(rest, function(value, key){
      if (result.xdex && result.xdex == value) {
        xsame.push(key);
      }
      if (result.ydex && result.ydex == value) {
        ysame.push(key);
      }
      if (result.xydex && result.xydex == value) {
        xysame.push(key);
      }
    });

    return [result.xdex, result.ydex, result.xydex,
      xsame.join(' '), ysame.join(' '), xysame.join(' ')].join('\t');
  });
};