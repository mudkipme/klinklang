var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

var Translation = Backbone.Model.extend({
  defaults: {
    type: 'itemtable'
    ,source: ''
    ,result: ''
  }

  ,types: {
    'itemtable': '地点道具表'
    ,'catch': '地点神奇宝贝表'
    ,'trainer': '地点训练家表'
  }

  ,translate: function(){
    var self = this;

    $.ajax({
      type: 'POST'
      ,url: '/api/translate'
      ,data: JSON.stringify(_.omit(this.toJSON(), 'result'))
      ,contentType: 'application/json'
      ,dataType: 'json'
      ,success: function(res){
        self.set('result', res.result);
      }
    });
  }
});

module.exports = Translation;