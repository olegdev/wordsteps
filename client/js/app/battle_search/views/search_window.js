/*** Окно поиска противника */
define([
	'jquery',
	'underscore',
	'backbone',
	'location/views/window',
	'location/views/opponents',
	'location/views/user_avatar',
	'text!battle_search/templates/search_window.tpl',
	'references/messages',
], function($, _, Backbone, windowView, opponentsView, avatarView, tpl, messages) {

	var View = windowView.extend({

		/** @cfg */
		title: messages.getByKey('window_title_search'),

		initialize: function(config) {
			config.content = _.template(tpl)({user: APP.user.attributes, messages: messages, opponentsView: opponentsView});
			windowView.prototype.initialize.apply(this, arguments);
		},

		showMessage: function(message) {
			$(this.$el.find('.hints')[0]).html(message);
		},

		showEnemyInfo: function(data) {
			$(this.$el.find('.opponents .enemy-avatar')[0]).remove();
			$(this.$el.find('.opponents')[0]).append(avatarView.print(data, 'rtl enemy-avatar'));
		}

	});

	return View;
});