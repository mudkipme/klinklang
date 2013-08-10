var _ = require('underscore');
var Species = require('./species');
var db = require('../models/database').base;

exports.pokemonLink = function(species, callback){
  if (!isNaN(species)) species = parseInt(species);

  db.all('SELECT max_link, rank, name FROM conquest_max_links JOIN conquest_warrior_ranks ON conquest_max_links.warrior_rank_id = conquest_warrior_ranks.id JOIN conquest_warrior_names ON conquest_warrior_ranks.warrior_id = conquest_warrior_names.warrior_id WHERE local_language_id = 4 AND max_link > 0 AND pokemon_species_id = ' + Species.needle(species) + ' ORDER BY conquest_warrior_ranks.warrior_id, rank', [species], function(err, rows){
    if (err) return callback(err);

    var result = [];
    _.each(rows, function(row){
      var item = _.find(result, function(line){ return line.name == row.name; });
      if (!item) {
        item = { name: row.name, links: [] };
        result.push(item);
      }
      item.links[row.rank - 1] = row.max_link;
    });
    callback(null, result);
  });
};

exports.pokemonStat = function(species, callback){
  if (!isNaN(species)) species = parseInt(species);

  db.all('SELECT base_stat, identifier FROM conquest_pokemon_stats JOIN conquest_stats ON conquest_stat_id = id WHERE pokemon_species_id = ' + Species.needle(species), [species], function(err, rows){
    if (err) return callback(err);

    var result = {};
    _.each(rows, function(row){
      result[row.identifier] = row.base_stat;
    });
    callback(null, result);
  });
};