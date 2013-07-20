define([
  'zepto'
  ,'underscore'
  ,'backbone'
  ,'models/replacement'
  ,'text!templates/replacer.html'
  ,'foundation/foundation.forms'
], function($, _, Backbone, Replacement, replacerTemplate, Forms){

  var Replacer = Backbone.View.extend({
    id: 'replacer'

    ,events: {
      'change #language-from-select': 'setSourceLng'
      ,'change #language-to-select': 'setResultLng'
      ,'mouseup #replace-source': 'syncHeight'
      ,'blur #replace-source': 'setSource'
      ,'change .select-text input:not(#text-all)': 'select'
      ,'change #text-all': 'selectAll'
      ,'click #replace-button': 'replace'
    }

    ,initialize: function(){
      this.model = new Replacement;
    }

    ,render: function(){
      var self = this;
      this.$el.html(_.template(replacerTemplate, this.model.opts))
      this.update();
      this.listenTo(this.model, 'change', this.update);
      return this;
    }

    ,setSourceLng: function(e){
      this.model.set('sourceLng', e.target.value);
    }

    ,setResultLng: function(e){
      this.model.set('resultLng', e.target.value);
    }

    ,setSource: function(e){
      this.model.set('source', e.target.value);
    }

    ,select: function(e){
      var texts = this.model.get('texts');
      if (e.target.checked) {
        texts = _.union(texts, [e.target.value]);
      } else {
        texts = _.without(texts, e.target.value);
      }
      this.model.set('texts', texts);
    }

    ,selectAll: function(e){
      var texts = e.target.checked ? _.keys(this.model.opts.texts) : [];
      this.model.set('texts', texts);
    }

    ,update: function(e){
      var texts = this.model.get('texts');
      this.$('.select-text input:not(#text-all)').each(function(i, input){
        if (texts.indexOf(input.value) > -1) {
          $(input).prop('checked', true).next().addClass('checked');
        } else {
          $(input).prop('checked', false).next().removeClass('checked');
        }
      });

      if (texts.length == _.keys(this.model.opts.texts).length) {
        this.$('#text-all').prop('checked', true).next().addClass('checked');
      } else {
        this.$('#text-all').prop('checked', false).next().removeClass('checked');
      }

      this.$('#language-from-select').val(this.model.get('sourceLng'));
      this.$('#language-to-select').val(this.model.get('resultLng'));
      this.$('#replace-source').text(this.model.get('source'));
      this.$('#replace-result').text(this.model.get('result'));
      Forms.refresh_custom_select(this.$('#language-from-select'), true);
      Forms.refresh_custom_select(this.$('#language-to-select'), true);
    }

    ,replace: function(){
      this.model.replace();
    }

    ,syncHeight: function(e){
      this.$('#replace-result').height($(e.target).height());
    }
  });

  return Replacer;
});