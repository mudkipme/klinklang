var async = require('async');
var _ = require('underscore');
var Species = require('../models/species');
var Conquest = require('../models/conquest');
var db = require('../models/database').base;

var addPower = function(wiki, move, power, callback){
  var title = move + '（旁支系列）';

  wiki.getSection(title, '[[神奇宝贝＋信长的野望|信长的野望]]中', function(err, content, rvsection){
    if (err) return callback(err);
    if (!content) {
      console.log('Cannot find ' + title);
      return callback(null);
    }

    content = wiki.addAttrs(content, '信长的野望技能', { power: power });

    if (!content) {
      console.log('Failed adding ' + title + ' power.');
      callback(null);
    }

    wiki.edit(title, content, {section: rvsection}, function(err, res){
      if (err) return callback(err);
      console.log(res.result + ' modified ' + title);
      callback(null);
    });
  });
};

var addPokemonLink = function(wiki, title, callback){
  var species = title.split('（旁支系列）')[0];

  async.series({
    typeNames: function(next){
      Species.typeName(species, next);
    }
    ,stats: function(next){
      Conquest.pokemonStat(species, next);
    }
    ,links: function(next){
      Conquest.pokemonLink(species, next);
    }
  }, function(err, result){
    if (err) return callback(err);

    wiki.getArticle(title, function(err, content){
      if (err) return callback(err);
      if (!content) {
        console.log('Cannot find ' + title);
        return callback(null);
      }

      var newContent = wiki.addAttrs(content, '神奇宝贝信长的野望信息框', {
        HPStat: result.stats.hp
        ,ATKStat: result.stats.attack
        ,DEFStat: result.stats.defense
        ,SPStat: result.stats.speed
      });

      if (!newContent) {
        console.log('Failed adding ' + title + ' stats.');
      } else {
        content = newContent;
      }

      var lines = ['===连接武将==='];
      lines.push('{{信长的野望连接/h|' + result.typeNames.join('|') + '}}');
      _.each(result.links, function(link){
        lines.push('{{信长的野望连接|' + link.name + '|' + link.links.join('|') + '}}');
      });
      lines.push('|}');

      content = content.split('===连接武将===\n{{未完成}}').join(lines.join('\n'));

      wiki.edit(title, content, {summary: '增加连接武将'}, function(err, res){
        if (err) return callback(err);
        console.log(res.result + ' modified ' + title);
        callback(null);
      });
    });
  });
};

// 给百科中的信长的野望技能条目增加威力
exports.addMovePower = function(wiki, callback){
  db.all('SELECT power, name FROM conquest_move_data JOIN move_names ON conquest_move_data.move_id = move_names.move_id WHERE local_language_id = 4', function(err, rows){
    if (err) callback(err);

    async.eachSeries(rows, function(row, callback){
      addPower(wiki, row.name, row.power, callback);
    }, callback);
  });
};

// 信长的野望神奇宝贝中的连接武将
exports.addPokemonLink = function(wiki, callback){
  wiki.getPagesInCategory('神奇宝贝（信长的野望）', function(err, pages){
    async.eachSeries(pages, function(page, callback){
      addPokemonLink(wiki, page.title, callback);
    }, callback);
  });
};