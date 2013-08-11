var fs = require('fs');
var async = require('async');
var _ = require('underscore');

var getItemInfo = function(wiki, name, callback){
  wiki.getArticleZh(name + '（道具）', function(err, content){
    if (err) return callback(err);
    if (!content) {
      console.log('Cannot find ' + name);
      return callback(null);
    }

    var attrs = wiki.attrs(content, '道具信息框');
    if (!attrs || !attrs.info) {
      console.log('Failed get ' + name);
      return callback(null);
    }

    callback(null, attrs.info);
  });
};

exports.getItemInfo = function(wiki, callback){
  var filename = __dirname + '/../database/item.json';
  fs.readFile(filename, {encoding: 'utf8'}, function(err, content){
    var items = JSON.parse(content), result = {};
    async.eachSeries(_.pairs(items), function(item, next){
      getItemInfo(wiki, item[1], function(err, info){
        if (err) return next(err);
        result[item[0]] = info;
        next();
      });
    }, function(err){
      if (err) return callback(err);
      callback(null, result);
    });
  });
};

exports.getItemImage = function(wiki, callback){
  var filename = __dirname + '/../database/item.json';
  fs.readFile(filename, {encoding: 'utf8'}, function(err, content){
    var items = JSON.parse(content), result = {};
    async.eachSeries(_.pairs(items), function(item, next){
      wiki.imgUrl('Dream ' + item[1] + ' Sprite.png', function(err, url){
        if (err) return next(err);
        result[item[0]] = url;
        next();
      });
    }, function(err){
      if (err) return callback(err);
      callback(null, result);
    });
  });
};