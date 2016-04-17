/*** Кнопки управления основного экрана */
define([
	'jquery',
	'underscore',
	'backbone',
	'text!location/templates/views/controls.tpl',
	'references/messages'
], function($, _, Backbone, tpl, messages) {

	var View = Backbone.View.extend({

		template: _.template(tpl),

		render: function() {
			this.$el.html(this.template({messages: messages}));
			return this;
		},

	});

	return View;
});