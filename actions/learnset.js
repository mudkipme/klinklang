var async = require('async');
var _ = require('underscore');
var Species = require('../models/species');
var Learnset = require('../models/learnset');

var learnlist = function(wiki, species, callback){
  async.series([
    async.apply(Species.name, species, 'zh')
    ,async.apply(Species.typeName, species)
    ,async.apply(Species.generation, species)
    ,async.apply(Learnset.learnlist, species, 'level')
    ,async.apply(Learnset.learnlist, species, 'machine')
    ,async.apply(Learnset.learnlist, species, 'egg')
    ,async.apply(Learnset.learnlist, species, 'tutor')
  ], function(err, results){
    if (err) return callback(err);

    if (!results[3].length)
      return callback(null);

    var stab = function(row){
      return row.power != '—' && (row.type == results[1][0] || row.type == results[1][1]);
    };

    var lines = [];
    if (!results[1][1]) results[1][1] = results[1][0];
    lines.push('===可习得技能表===');

    if (results[3].length) {
      lines.push('====可学会的技能====');
      lines.push('{{learnlist/levelh|' + results[0] + '|' + results[1].join('|') + '|6|' + results[2] + '}}');
      _.each(results[3], function(row){
        lines.push("{{learnlist/level6|"+row.level+"|"+row.move+"|"+row.type+"|"+row.damage_class+"|"+row.power+"|"+row.accuracy+"|"+row.pp + (stab(row) ? "||'''" : "") + "}}");
      });
      lines.push('{{learnlist/levelf|' + results[0] + '|' + results[1].join('|') + '|6|' + results[2] + '}}');      
    }

    if (results[4].length) {
      lines.push('====能使用的技能学习器====');
      lines.push('{{learnlist/tmh|' + results[0] + '|' + results[1].join('|') + '|6|' + results[2] + '}}');
      _.each(results[4], function(row){
        lines.push("{{learnlist/tm6|"+row.machine_number+"|"+row.move+"|"+row.type+"|"+row.damage_class+"|"+row.power+"|"+row.accuracy+"|"+row.pp + (stab(row) ? "||'''" : "") + "}}");
      });
      lines.push('{{learnlist/tmf|' + results[0] + '|' + results[1].join('|') + '|6|' + results[2] + '}}');      
    }

    if (results[5].length) {
      lines.push('====蛋技能====');
      lines.push('{{learnlist/breedh|' + results[0] + '|' + results[1].join('|') + '|6|' + results[2] + '}}');
      _.each(results[5], function(row){
        var msp = _.map(row.father, function(father, index){
          return '{{MSP|' + ('00' + father.id).substr(-3) + '|' + father.name + '}}' + (index % 6 == 5 ? '<br>' : '');
        }).join('');
        lines.push("{{learnlist/breed6|"+msp+"|"+row.move+"|"+row.type+"|"+row.damage_class+"|"+row.power+"|"+row.accuracy+"|"+row.pp + '|' + (row.chain ? '*' : '') + (stab(row) ? "|'''" : "") + "}}");
      });
      lines.push('{{learnlist/breedf|' + results[0] + '|' + results[1].join('|') + '|6|' + results[2] + '}}');      
    }

    if (results[6].length) {
      lines.push('====技能教学====');
      lines.push('{{learnlist/tutorh|' + results[0] + '|' + results[1].join('|') + '|6|' + results[2] + '}}');
      _.each(results[6], function(row){
        lines.push("{{learnlist/tutor6|"+row.move+"|"+row.type+"|"+row.damage_class+"|"+row.power+"|"+row.accuracy+"|"+row.pp+"||" + (stab(row) ? "'''" : "") + "|yes}}");
      });
      lines.push('{{learnlist/tutorf|' + results[0] + '|' + results[1].join('|') + '|6|' + results[2] + '}}');
    }

    writeLearnlist(wiki, results[0], lines.join('\n'), callback);
  });
};

var writeLearnlist = function(wiki, title, content, callback){
  wiki.getSection(title, ['可习得技能表', '可習得技能表'], function(err, text, rvsection){
    if (err) return callback(err);
    if (text.indexOf('level6') > -1 || !rvsection) return callback(null);

    wiki.edit(title, content, {section: rvsection}, function(err, result){
      if (err) return callback(err);
      callback(null, result);
    });
  });
};

var exportGenVLearnlist = function(wiki, species, callback){
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

exports.register = function(program, wiki){
  program
  .command('export-genv-learnlist <pokemon>')
  .description('Export Generation V Learnlist to seperate article.')
  .action(function(pokemon){
    exportGenVLearnlist(wiki, pokemon, function(err, result){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(result));
    });
  });

  program
  .command('learnlist <pokemon>')
  .description('Generate the learnlist of one Pokémon.')
  .action(function(pokemon){
    learnlist(wiki, pokemon, function(err, result){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(result));
    });
  });
};