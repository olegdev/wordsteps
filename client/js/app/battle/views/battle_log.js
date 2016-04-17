/*** Лог боя */
define([
	'jquery',
	'underscore',
	'backbone',
	'text!battle/templates/battle_log.tpl',
	'references/messages',
], function($, _, Backbone, tpl, messages) {

	var View = Backbone.View.extend({

		template: _.template(tpl),

		render: function() {
			var me = this;
			this.$el.html(this.template({}));
			return this;
		},

		addMessage: function(msg) {
			this.$el.append('<li>' + msg + '</li>');
		}
	});

	return View;
});