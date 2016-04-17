/*** Аватарка юзера */
define([
	'jquery',
	'underscore',
	'backbone',
	'text!location/templates/views/user_avatar.tpl'
], function($, _, Backbone, tpl) {

	var View = {
		template: _.template(tpl),
		print: function(userData, align) {
			return this.template({user: userData, align: align || "ltr"});
		},
	};

	return View;
});