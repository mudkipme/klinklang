define([
  'zepto'
  ,'underscore'
  ,'backbone'
  ,'models/scss'
  ,'text!templates/scss.html'
], function($, _, Backbone, Scss, scssTemplate){
  
  var ScssView = Backbone.View.extend({
    id: 'scss'

    ,events: {
      'blur #scss-text': 'setText'
      ,'click #load-wiki': 'loadWikiScss'
      ,'click #convert-css': 'convert'
    }

    ,initialize: function(){
      this.model = new Scss;
    }

    ,render: function(){
      this.$el.html(scssTemplate);
      this.update();
      this.listenTo(this.model, 'change', this.update);
      return this;
    }

    ,update: function(){
      this.$('#scss-text').val(this.model.get('text')).prop('disabled', false);
    }

    ,setText: function(e){
      this.model.set('text', e.target.value);
    }

    ,loadWikiScss: function(){
      this.$('#scss-text').prop('disabled', true);
      this.model.loadWikiScss();
    }

    ,convert: function(){
      this.$('#scss-text').prop('disabled', true);
      this.model.convert();
    }
  });

  return ScssView;
});