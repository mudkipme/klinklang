define([
  'zepto'
  ,'underscore'
  ,'backbone'
  ,'models/translation'
  ,'text!templates/translator.html'
], function($, _, Backbone, Translation, translatorTemplate){

  var Translator = Backbone.View.extend({
    id: 'translator'

    ,events: {
      'change .select-type input': 'setType'
      ,'mouseup #translate-source': 'syncHeight'
      ,'blur #translate-source': 'setSource'
      ,'click #translate-button': 'translate'
    }

    ,initialize: function(){
      this.model = new Translation;
    }

    ,render: function(){
      var self = this;
      this.$el.html(_.template(translatorTemplate, {
        types: this.model.types
      }));
      this.update();
      this.listenTo(this.model, 'change', this.update);
      return this;
    }

    ,update: function(){
      this.$('.select-type input[value="'+this.model.get('type')+'"]')
      .prop('checked', true);
      this.$('#translate-source').text(this.model.get('source'));
      this.$('#translate-result').text(this.model.get('result'));
    }

    ,setType: function(e){
      this.model.set('type', e.target.value);
    }

    ,setSource: function(e){
      this.model.set('source', e.target.value);
    }

    ,translate: function(){
      this.model.translate();
    }

    ,syncHeight: function(e){
      this.$('#replace-result').height($(e.target).height());
    }
  });

  return Translator;
});