var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var Router = require('./router');
var TopBar = require('./views/topbar');

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