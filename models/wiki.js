// Inspired by https://github.com/macbre/nodemw
// License: https://github.com/macbre/nodemw/blob/master/LICENSE

var request = require('request');
var async = require('async');
var _ = require('underscore');
var tongwen = require('tongwen');
var parseString = require('xml2js').parseString;

var Wiki = function(options){
  'use strict';
  var me = this;
  options = options || {};
  me.api = options.api || require('../config.json').wiki.api;
  me.userAgent = options.userAgent
    || 'MudkipRadar v' + require('../package.json').version;
  me.jar = options.jar || true;

  // Request queue
  me.queue = async.queue(function(params, callback){
    params = params || {};
    params.format = 'json';

    var action = params.action;

    // due to 52Poké Wiki's caching strategy, alway use post here
    request.post({
      url: me.api
      ,jar: me.jar
      ,headers: {
        'User-Agent': me.userAgent
      }
      ,form: params
    }, function(err, response, body){
      if (err) return callback(err);

      var data, info, next;

      try {
        data = JSON.parse(body);
        info = data && data[action];
        next = data && data['query-continue'] && data['query-continue'][params.list];
      } catch (e) {
        return callback(e);
      }

      if (data.error) return callback(new Error(data.error.info));
      callback(null, info, next, data);
    });
  }, 1);
};

Wiki.prototype.request = function(params, callback){
  this.queue.push(params, callback);
};

Wiki.prototype.login = function(username, password, callback){
  var me = this;

  this.request({
    action: 'login'
    ,lgname: username
    ,lgpassword: password
  }, function(err, data){
    if (err) return callback(err);

    if (data.result == 'NeedToken') {
      var token = data.token;

      me.request({
        action: 'login'
        ,lgname: username
        ,lgpassword: password
        ,lgtoken: token
      }, function(err, data){
        if (err) return callback(err);

        if (typeof data.lgusername !== 'undefined') {
          callback(null, data);
        } else {
          callback(new Error('Unknown login error.'));
        }
      });
    } else {
      callback(new Error('Unknown login error.'));
    }
  });
};

Wiki.prototype.whoami = function(callback){
  this.request({
    action: 'query'
    ,meta: 'userinfo'
    ,uiprop: [
      'groups'
      ,'rights'
      ,'ratelimits'
      ,'editcount' 
      ,'realname'
      ,'email'
    ].join('|')
  }, function(err, data){
    if (err) return callback(err);

    if (data && data.userinfo) {
      callback(null, data.userinfo);
    } else {
      callback(new Error('Get userinfo failed.'));
    }
  });
};

Wiki.prototype.getArticle = function(title, options, callback){
  if (!callback) {
    callback = options;
    options = {};
  }

  options = _.defaults(options, {
    action: 'query'
    ,prop: 'revisions'
    ,rvprop: 'content'
  });

  if (typeof title === 'number') {
    options.pageids = title;
  } else {
    options.titles = title;
  }

  this.request(options, function(err, data){
    if (err) return callback(err);
    var page = _.values(data.pages)[0];
    var revision = page.revisions && page.revisions.shift();
    var content = revision && revision['*'];

    callback(null, content || '');
  });
};

Wiki.prototype.getArticleZh = function(title, options, callback){
  if (!callback) {
    callback = options;
    options = {};
  }
  var me = this;
  me.getArticle(tongwen.t2s(title), options, function(err, content){
    if (err) return callback(err);
    if (content) return callback(null, content);

    me.getArticle(tongwen.s2t(title), options, callback);
  });
};

Wiki.prototype.getSection = function(title, sectionName, options, callback){
  if (!callback) {
    callback = options;
    options = {};
  }

  // Support mutiple section names and choose the first section found.
  if (!Array.isArray(sectionName)) {
    sectionName = [sectionName];
  }

  var me = this;
  me.getArticle(title, options, function(err, content){
    if (err) return callback(err);

    var matches = content.match(/^=+([^=]*)=+\s*$/mg);

    _.each(matches, function(match, index){
      if (sectionName.indexOf(match.split('=').join('').trim()) > -1) {
        options.rvsection = index + 1;
      }
    });

    if (!options.rvsection) return callback(null, '');

    me.getArticle(title, options, function(err, content){
      if (err) return callback(err);
      return callback(null, content, options.rvsection);
    });
  });
};

Wiki.prototype.getToken = function(title, action, callback){
  var params = {
    action: 'query'
    ,prop: 'info'
    ,intoken: action
  };

  if (typeof title === 'number') {
    params.pageids = title;
  } else {
    params.titles = title;
  }

  this.request(params, function(err, data){
    if (err) return callback(err);
    var page = _.values(data.pages)[0];
    var token = page[action + 'token'];

    if (!token) return callback(new Error('Get ' + action + ' token failed.'));
    callback(null, token);
  });
};

Wiki.prototype.edit = function(title, content, options, callback){
  if (!callback) {
    callback = options;
    options = {};
  }

  options = _.defaults(options, {
    action: 'edit'
    ,bot: ''
    ,text: content
  });

  if (typeof title === 'number') {
    options.pageid = title;
  } else {
    options.title = title;
  }

  var me = this;
  me.getToken(title, 'edit', function(err, token){
    if (err) return callback(err);
    options.token = token;

    me.request(options, function(err, data){
      if (err) return callback(err);
      callback(null, data);
    });
  });
};

Wiki.prototype.purge = function(title, callback){
  this.request({
    action: 'purge'
    ,titles: title
  }, callback);
};

Wiki.prototype.getPagesInCategory = function(category, callback){
  var pages = [], me = this;

  var fetch = function(next){
    me.request(_.extend({
      action: 'query'
      ,list: 'categorymembers'
      ,cmtitle: 'Category:' + category
      ,cmlimit: 5000
    }, next), function(err, data, next){
      if (err) return callback(err);

      pages = pages.concat(data && data.categorymembers || []);

      if (next) {
        fetch(next);
      } else {
        callback(null, pages);
      }
    });
  };

  fetch();
};

Wiki.prototype.addAttrs = function(content, template, attrs){
  var matches = content.match(new RegExp('{{' + tongwen.t2s(template) + '([^}]*?)}}'));
  var newAttrs = [];

  if (!matches || !matches[1])
    matches = content.match(new RegExp('{{' + tongwen.s2t(template) + '([^}]*?)}}'));

  if (!matches || !matches[1]) return false;

    _.each(attrs, function(value, key){
    if (matches[1].indexOf(key + '=') == -1) {
      newAttrs.push('|\n' + key + '=' + value);
    }
  });

  if (!newAttrs.length) return false;

  return content.split(matches[0])
    .join('{{' + template + newAttrs.join('\n') + matches[1].trim() + '}}');
};

Wiki.prototype.attrs = function(content, template){
  var matches = content.match(new RegExp('{{' + template + '([^}]*?)}}'));
  if (!matches || !matches[1]) return false;

  var result = {};

  matches[1].replace(/\|\s*(\w+)\s*=([^\|}]*)/g, function(match, key, value){
    result[key] = value.trim();
    return match;
  });

  return result;
};

Wiki.prototype.getAttrs = function(content, template, callback){
  this.request({
    action: 'expandtemplates'
    ,text: content
    ,generatexml: 1
  }, function(err, info, next, data){
    if (err) return callback(err);
    if (!data || !data.parsetree || !data.parsetree['*']) return callback(null);
    parseString(data.parsetree['*'], function(err, res){
      try {
        var result = {}, parts;
        _.some(res.root.template, function(t){
          if (t.title[0].trim() == template) {
            parts = t.part;
            return true;
          }
        });

        _.each(parts, function(part){
          var name = part.name[0], value = part.value[0];
          _.isObject(name) && (name = name['$'].index);
          _.isObject(value) && (value = value['_']);
          result[name.trim()] =  value.trim();
        });

        callback(null, result);

      } catch(e) { return callback(e); }
    });
  });
};

Wiki.prototype.imgUrl = function(filename, callback){
  this.request({
    action: 'query'
    ,titles: 'File:' + filename
    ,prop: 'imageinfo'
    ,iiprop: 'url'
  }, function(err, data){
    if (err) return callback(err);
    var page = _.values(data.pages)[0];
    var url = page && page.imageinfo && page.imageinfo[0].url;
    callback(null, url);
  });
};

Wiki.prototype.remoteUpload = function(filename, url, options, callback){
  if (!callback) {
    callback = options;
    options = {};
  }

  var me = this;

  me.getToken('File:' + filename, 'edit', function(err, token){
    if (err) return callback(err);

    options = _.defaults(options, {
      action: 'upload'
      ,url: url
      ,filename: filename
      ,token: token
      ,ignorewarnings: 'yes'
      ,prop: 'revisions'
      ,rvprop: 'content'
    });

    me.request(options, function(err, data){
      if (err) return callback(err);
      callback(null, data);
    });
  });
};

Wiki.prototype.redirect = function(source, dest, callback){
  var me = this;

  me.getArticle(source, function(err, text){
    if (err) return callback(err);
    if (text) return callback(null, 'Skip ' + source);

    dest = tongwen.t2s(dest);

    me.getArticle(dest, function(err, text){
      if (err) return callback(err);
      if (text) return me.edit(source, '#REDIRECT [[' + dest + ']]', callback);

      dest = tongwen.s2t(dest);
      me.getArticle(dest, function(err, text){
        if (!text) return callback(null, 'Skip ' + dest);
        me.edit(source, '#REDIRECT [[' + dest + ']]', callback);
      });
    });
  });
};

module.exports = Wiki;