define([
  'zepto'
  ,'underscore'
  ,'backbone'
  ,'router'
  ,'views/topbar'
  ,'foundation/foundation.topbar'
  ,'foundation/foundation.forms'
], function($, _, Backbone, Router, TopBar){

  var initialize = function(){
    $(function(){
      var router = new Router;
      var topBar = new TopBar;

      router.bind('route', function(route){
        topBar.update(route);
      });
      
      topBar.render();
      $(document).foundation();

      Backbone.history.start({pushState: true});
    });
  };

  return {
    initialize: initialize
  };
});