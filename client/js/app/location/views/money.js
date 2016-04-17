/*** Печать денег */
define([
	'jquery',
	'underscore',
	'backbone',

	'text!location/templates/views/money.tpl',
	'references/messages',

], function($, _, Backbone, tpl, messages) {

	var View = {
		template: _.template(tpl),
		print: function(value) {
			return this.template({value: value, messages: messages});
		},
	};

	return View;
});