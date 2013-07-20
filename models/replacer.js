var fs = require('fs')
  , path = require('path')
  , csv = require('csv')
  , async = require('async')
  , _ = require('underscore');

var tableCache = {}, tables = [];

var loadText = function(text, callback) {
  if (tableCache[text])
    return callback(null, tableCache[text]);

  var table = [];

  csv().from(
    __dirname + '/../database/texts/' + path.basename(text) + '.csv'
    ,{columns: ['zh', 'ja', 'en']}
  )
  .on('record', function(row, index){
    table.push(row);
  })
  .on('end', function(){
    tableCache[text] = table;
    if (text == 'type') {
      table = table.concat(_.map(table, function(row){
        return {zh: row.zh, ja: row.ja, en: row.en.toLowerCase()};
      }));
    }
    callback(null, table);
  })
  .on('error', function(err){
    callback(err);
  });
};

exports.loadText = function(texts, callback) {
  texts = texts || [];

  var actions = [];
  texts.forEach(function(text){
    actions.push(function(next){
      loadText(text, next);
    });
  });
  async.series(actions, callback);
};

exports.allTables = function(callback) {
  if (tables.length > 0) return callback(null, tables);

  fs.readdir(__dirname + '/../database/texts', function(err, files){
    if (err) return callback(err);
    files.forEach(function(fileName){
      if (/\.csv$/.test(fileName)) {
        tables.push(path.basename(fileName, '.csv'));
      }
    });
    callback(null, tables);
  });
};

exports.replaceTextSync = function(source, results, sourceLng, resultLng) {
  source = source || '';
  sourceLng = sourceLng || 'en';
  resultLng = resultLng || 'zh';
  
  var all = _.flatten(results, true);

  all.sort(function(x, y){
    return y[sourceLng].length - x[sourceLng].length;
  });

  all.forEach(function(row){
    if (row[sourceLng] && row[resultLng]) {
      source = source.split(row[sourceLng]).join(row[resultLng]);
    }
  });

  return source;
};

exports.replaceText = function(source, options, callback) {
  exports.loadText(options.texts, function(err, results){
    if (err) return callback(err);
    
    source = exports.replaceTextSync(source, results,
      options.sourceLng, options.resultLng);

    callback(null, source);
  });
};