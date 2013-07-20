define([
  'zepto'
  ,'underscore'
  ,'backbone'
  ,'views/replacer'
  ,'views/translator'
  ,'views/scss'
], function($, _, Backbone, Replacer, Translator, ScssView){
  
  var Router = Backbone.Router.extend({
    routes: {
      '': 'replacer'
      ,'replacer': 'replacer'
      ,'translator': 'translator'
      ,'scss': 'scss'
      ,'card': 'card'
    }

    ,views: []

    ,switchView: function(view){
      if (this.currentView) {
        this.currentView.remove();
      }
      this.currentView = view;
      $('main').prepend(view.render().el);
      $(document).foundation('forms', 'assemble');
    }

    ,replacer: function(){
      this.views.replacer = this.views.replacer || new Replacer;
      this.switchView(this.views.replacer);
    }

    ,translator: function(){
      this.views.translator = this.views.translator || new Translator;
      this.switchView(this.views.translator);
    }

    ,scss: function(){
      this.views.scss = this.views.scss || new ScssView;
      this.switchView(this.views.scss);
    }

    // TODO: New Card Generator
    ,card: function(){
      location.replace('http://lab.mudkip.me/wiki-utilities/card.html');
    }
  });

  return Router;
});