var fs = require('fs');
var csv = require('csv');
var async = require('async');
var _ = require('underscore');
var db = require('../models/database.js').base;
var translation = require('../config.json').translation;

var importTable = function(tableName, callback){
  var insertStmt;

  csv()
  .from(__dirname + '/../database/veekun/' + tableName + '.csv')
  .on('record', function(data, index){
    db.serialize(function(){
      if (index == 0) {
        db.run('BEGIN TRANSACTION');
        db.run('DROP TABLE IF EXISTS ' + tableName);

        db.run('CREATE TABLE ' + tableName + ' ('
          + _.map(data, function(item){ return '`' + item + '`' }) + ')');

        insertStmt = db.prepare('INSERT INTO ' + tableName + ' VALUES ('
          + _.map(data, function(){ return '?' }).join(',') + ')');
        return;
      }

      // Convert numberic String to Number
      data = _.map(data, function(element){
        return (!element.length || isNaN(element)) ? element : Number(element);
      });

      insertStmt.run.apply(insertStmt, data);
    });
  })
  .on('end', function(){
    db.serialize(function(){
      insertStmt.finalize();
      db.run('COMMIT', function(err){
        if (err) return callback(err);
        console.log('Imported table ' + tableName);
        callback();
      });
    });
  })
  .on('error', function(err){
    callback(err);
  });
};

var importTranslation = function(tableName, csvFile, idField, callback){
  db.serialize(function(){
    db.run('BEGIN TRANSACTION');
    db.run('DELETE FROM ' + tableName + '_names WHERE local_language_id = 4');

    csv()
    .from(__dirname + '/../database/texts/' + csvFile + '.csv')
    .on('record', function(data, index){
      if (!data.length) return;

      db.serialize(function(){
        db.get(
          'SELECT * FROM ' + tableName + '_names WHERE name = ? AND local_language_id = 9'
          ,[data[2]]
          ,function(err, row){
            if (err) return callback(err);
            if (row) {
              db.serialize(function(){
                var mark = [], values = [];
                for (var i = 0; i < _.keys(row).length; i++) {
                  mark.push('?');
                  values.push('');
                }
                values[0] = row[idField];
                values[1] = 4;
                values[2] = data[0];
                mark = mark.join(',');

                db.run('INSERT INTO ' + tableName + '_names VALUES (' + mark + ')', values);
              });
            }
          })
      })
    })
    .on('end', function(){
      db.serialize(function(){
        db.run('COMMIT', function(err){
          if (err) return callback(err);
          console.log('Imported ' + tableName + ' translation.');
          callback();
        });
      });
    })
    .on('error', function(err){
      callback(err);
    });
  });
};

exports.init = function(callback){
  fs.readdir(__dirname + '/../database/veekun', function(err, files){
    if (err) return callback(err);

    var actions = [];
    _.each(files, function(fileName){
      if (/\.csv$/.test(fileName)) {
        actions.push(function(callback){
            importTable(fileName.slice(0, -4), callback);
        });
      }
    });

    async.series(actions, callback);
  });
};

exports.initTranslation = function(callback){
  var actions = [];

  _.each(translation, function(row){
    actions.push(function(next){
      importTranslation(row[0], row[1], row[2], next);
    });
  });

  async.series(actions, callback);
};