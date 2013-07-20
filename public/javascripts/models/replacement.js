define([
  'zepto'
  ,'underscore'
  ,'backbone'
], function($, _, Backbone){
  
  var Replacement = Backbone.Model.extend({
    defaults: {
      source: ''
      ,sourceLng: 'en'
      ,result: ''
      ,resultLng: 'zh'
      ,texts: []
    }

    ,opts: {
      lngs: {'en': '英语', 'ja': '日语', 'zh': '中文'}
      ,texts: {
        pokemon: '神奇宝贝'
        ,ability: '特性'
        ,move: '技能'
        ,type: '属性'
        ,item: '道具'
        ,tcg: '卡片游戏'
        ,location: '地点'
        ,nature: '性格'
        ,'trainer-type': '训练家类型'
        ,'location-type': '地点类型'
        ,warriors: '武将'
        ,other: '其他'
      }
    }

    ,replace: function(){
      var self = this;

      $.ajax({
        type: 'POST'
        ,url: '/api/replace'
        ,data: JSON.stringify(_.omit(this.toJSON(), 'result'))
        ,contentType: 'application/json'
        ,dataType: 'json'
        ,success: function(res){
          self.set('result', res.result);
        }
      });
    }
  });

  return Replacement;
});