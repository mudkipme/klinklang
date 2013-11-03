var async = require('async');
var Species = require('../models/species');

exports.exportGenVLearnlist = function(wiki, species, callback){
  async.series([
    async.apply(Species.name, species, 'zh')
    ,async.apply(Species.typeName, species)
    ,async.apply(Species.name, species, 'en')
  ], function(err, results){
    if (err) return callback(err);

    var name = results[0], types = results[1], enName = results[2];
    var number = ('00' + species).substr(-3);

    wiki.getSection(name, '可习得技能表', function(err, content){
      if (err) return callback(err);

      var con = '{{技能表间链接|' + name + '|' + number + '|5|' + types.join('|') + '}}\n';
      con += content;
      con += '[[Category:神奇宝贝技能表（第五世代）|' + number + ']]';
      con += '[[en:' + enName + ' (Pokémon)/Generation V learnset]]';

      wiki.edit(name + '/第五世代技能表', con, callback);
    });
  });
};