var _ = require('underscore');
var async = require('async');
var db = require('../models/database').base;

var damageClass = ['变化', '物理', '特殊'];
var learnType = {
  level: 1,
  egg: 2,
  tutor: 3,
  machine: 4
};

var getRelatedPokemon = function(ids, callback){
  var inStr = ids.join(',');

  db.all('SELECT id, name FROM pokemon_species JOIN pokemon_species_names ON id = pokemon_species_id WHERE local_language_id = 4 AND (id IN (' + inStr + ') OR evolves_from_species_id IN (' + inStr + ') OR evolves_from_species_id IN (SELECT id FROM pokemon_species WHERE evolves_from_species_id IN (' + inStr + ')))', function(err, rows){
    if (err) return callback(err);

    callback(null, rows);
  });
};

exports.learnlist = function(species, type, callback){

  db.all('SELECT level, (SELECT machine_number FROM machines WHERE machines.move_id = pokemon_moves.move_id AND machines.version_group_id = 15) AS machine_number, pokemon_moves.move_id AS move_id, move_names.name AS move, type_names.name AS type, damage_class_id AS damage_class, power, pp, accuracy FROM pokemon_moves JOIN moves ON pokemon_moves.move_id = moves.id JOIN move_names ON moves.id = move_names.move_id JOIN type_names ON moves.type_id = type_names.type_id WHERE pokemon_id = ? AND pokemon_move_method_id = ? AND move_names.local_language_id = 4 AND type_names.local_language_id = 4 AND version_group_id = 15 ORDER BY level, machine_number, `order`', [parseInt(species), learnType[type]], function(err, rows){
    if (err) return callback(err);

    _.each(rows, function(row){
      if (row.level == 1) row.level = '—';
      if (!row.power) row.power = '—';
      if (!row.accuracy) row.accuracy = '—';
      if (row.machine_number) {
        row.machine_number = row.machine_number > 100 ? '秘传技学习器0' + row.machine_number % 100 : (row.machine_number < 10 ? '技能学习器0' + row.machine_number : '技能学习器' + row.machine_number);
      }
      row.damage_class = damageClass[row.damage_class - 1];
    });

    if (type != 'egg' && type != 'level') return callback(null, rows);

    if (type == 'level') {
      db.get('SELECT evolves_from_species_id, (SELECT name FROM pokemon_species_names WHERE pokemon_species_id = evolves_from_species_id AND local_language_id = 4) AS name FROM pokemon_species WHERE id = ?', [parseInt(species)], function(err, row){
        if (!row) return callback(null, rows);

        exports.learnlist(row.evolves_from_species_id, 'level', function(err, rows2){
          var rows2 = _.filter(rows2, function(r){
            if ((r.level + '').indexOf('MSP') == -1) {
              r.level = '{{MSP|' + row.evolves_from_species_id + '|' + row.name + '}}' + r.level;
            }
            return !_.findWhere(rows, {move_id: r.move_id});
          });
          rows = rows2.concat(rows);
          callback(null, rows);
        });
      });

      return;
    }

    async.mapSeries(rows, function(row, next){
      exports.father(species, row.move_id, function(err, result){
        if (err) return next(err);
        _.extend(row, result);
        next(null, row);
      });
    }, callback);
  });
};

exports.father = function(species, move, callback){
  var result = {};

  species = parseInt(species);
  move = parseInt(move);

  var ret = function(rows){
    getRelatedPokemon(_.pluck(rows, 'pokemon_id'), function(err, father){
      if (err) return callback(err);
      result.father = father;
      callback(null, result);
    });
  };

  var sql = 'SELECT DISTINCT pokemon_id FROM pokemon_moves JOIN pokemon_egg_groups ON species_id = pokemon_id AND version_group_id IN (5,6,7,8,9,10,11,14,15) AND move_id = ? AND pokemon_move_method_id = ? AND egg_group_id IN (SELECT egg_group_id FROM pokemon_egg_groups WHERE species_id = ? OR species_id = (SELECT id FROM pokemon_species WHERE evolves_from_species_id = ?)) AND species_id != ? AND pokemon_id < 1000 AND egg_group_id != 15 JOIN pokemon_species ON pokemon_id = pokemon_species.id AND gender_rate != 8';

  db.all(sql, [move, 1, species, species, species], function(err, rows){
    if (err) return callback(err);

    if (!rows.length) {
      result.chain = true;
      db.all(sql, [move, 2, species, species, species], function(err, rows){
        if (err) return callback(err);
        ret(rows);
      });
    } else {
      ret(rows);
    }
  });
};