/*** Отображает панель с противниками */
define([
	'jquery',
	'underscore',
	'backbone',
	'location/views/user_avatar',
	'text!location/templates/views/opponents.tpl'
], function($, _, Backbone, avatarView, tpl) {

	var View = {
		template: _.template(tpl),
		print: function(userData, enemyData) {
			return this.template({user: userData, enemy: enemyData, avatarView: avatarView});
		},
	};

	return View;
});