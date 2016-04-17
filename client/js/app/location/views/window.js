/*** Всплывающее окошко */
define([
	'jquery',
	'underscore',
	'backbone',
	'text!location/templates/views/window.tpl'
], function($, _, Backbone, tpl) {

	var View = Backbone.View.extend({

		/** @cfg */
		title: '',
		content: '',

		id: 'window',
		template: _.template(tpl),

		events: {
			'click .window-close' : 'close',
		},

		initialize: function(config) {
			_.extend(this, {
				width: 450,
				height: 225,
			}, config || {});

			this.render();
		},

		render: function() {
			this.$el.width(this.width);
			this.$el.height(this.height);
			this.$el.css({'left': $('#location').css('margin-left'), 'top': $('#location').css('margin-top')});
			this.$el.html(this.template(this));
			$(document.body).append('<div id="window-mask"></div>');
			$(document.body).append(this.$el);
			return this;
		},

		close: function() {
			$('#window-mask').remove();
			this.$el.remove();
			this.trigger('close');
		}
	});

	return View;
});