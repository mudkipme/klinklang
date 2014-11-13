var $ = window.jQuery = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
require('foundation');
require('foundation.topbar');

var TopBar = Backbone.View.extend({
  el: '#top-bar'

  ,events: {
    'click a:not(.external)': 'navigate'
  }

  ,render: function(){
    $(this.el).foundation('topbar');
    return this;
  }

  ,update: function(route){
    this.$('li.active').removeClass('active');
    this.$('a[data-route="' + route + '"]')
    .closest('li').addClass('active');
  }

  ,navigate: function(e){
    e.preventDefault();
    Backbone.history.navigate(e.target.pathname, {trigger: true});
  }
});

module.exports = TopBar;