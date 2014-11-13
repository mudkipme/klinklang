var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
  
var Scss = Backbone.Model.extend({
  defaults: {text: ''}

  ,apiUrl: 'http://wiki.52poke.com/api.php'
  ,apiTitle: '神奇宝贝百科:层叠样式表'

  ,loadWikiScss: function(){
    var self = this;
    $.getJSON(this.apiUrl + '?callback=?&' + $.param({
      action: 'query'
      ,prop: 'revisions'
      ,rvprop: 'content'
      ,titles: this.apiTitle
      ,format: 'json'
    }), function(res){
      try {
        var pageId = _.keys(res.query.pages)[0];
        text = res.query.pages[pageId].revisions[0]['*'];
        var matches = text.match(/<pre>([\s\S]*?)<\/pre>/);

        self.set('text', matches[1].trim());
      } catch(e) {
        self.set('text', e.message);
      }
    });
  }

  ,convert: function(){
    var self = this;
    $.ajax({
      type: 'POST'
      ,url: '/api/scss'
      ,data: JSON.stringify(this.toJSON())
      ,contentType: 'application/json'
      ,dataType: 'json'
      ,success: function(res){
        self.set('text', res.result);
      }
    });
  }
});

module.exports = Scss;