requirejs.config({
  paths: {
    templates: '../templates',
    text: '../components/requirejs-text/text',
    zepto: '../components/foundation/js/vendor/zepto',
    underscore: '../components/underscore/underscore',
    backbone: '../components/backbone/backbone',
    foundation: '../components/foundation/js/foundation'
  },
  shim: {
    'zepto': { exports: '$' },
    'underscore': { exports: '_' },
    'backbone': { exports: 'Backbone', deps: ['zepto'] },
    'foundation/foundation' : { exports: 'Foundation', deps: ['zepto'] },
    'foundation/foundation.abide': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.alerts': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.clearing': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.cookie': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.dropdown': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.forms': {
        exports: 'Foundation.libs.forms',
        deps: ['zepto', 'foundation/foundation']
    },
    'foundation/foundation.interchange': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.joyride': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.magellan': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.orbit': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.placeholder': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.reveal': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.section': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.tooltips': { deps: ['zepto', 'foundation/foundation'] },
    'foundation/foundation.topbar': { deps: ['zepto', 'foundation/foundation'] }
  }
});

require(['app'], function(app){
  app.initialize();
});