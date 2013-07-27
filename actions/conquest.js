var async = require('async');
var db = require('../models/database.js').base;

var addPower = function(wiki, move, power, callback){
  var title = move + '（旁支系列）';

  wiki.getSection(title, '[[神奇宝贝＋信长的野望|信长的野望]]中', function(err, content, rvsection){
    if (err) return callback(err);
    if (!content) {
      console.log('Cannot find ' + title);
      return callback(null);
    }

    var matches = content.match(/{{信长的野望技能([^}]*?)}}/);

    if (matches && matches[1]) {
      if (matches[1].indexOf('|power=') > -1) {
        console.log(title + 'not modified.');
        return callback(null);
      }

      matches[1] += '|power=' + power + '\n';
      content = content.split(matches[0]).join('{{信长的野望技能' + matches[1] + '}}');
      
      wiki.edit(title, content, {section: rvsection}, function(err, res){
        if (err) return callback(err);
        console.log(res.result + ' modified ' + title);
        callback(null);
      });
    } else {
      console.log('Parse ' + title + ' failed.');
      callback(null);
    }
  });
};

// 给百科中的信长的野望技能条目增加威力
exports.addMovePower = function(wiki, callback){
  var actions = [];

  db.each('SELECT power, name FROM conquest_move_data JOIN move_names ON conquest_move_data.move_id = move_names.move_id WHERE local_language_id = 4', function(err, row){
    if (err) callback(err);
    actions.push(function(next){
      addPower(wiki, row.name, row.power, next);
    });
  }, function(){
    async.series(actions, callback);
  });
};