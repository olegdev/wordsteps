/*** Окно рейтинга */
define([
	'jquery',
	'underscore',
	'backbone',

	'location/views/window',
	'text!rating/templates/rating_window.tpl',
	
	'references/messages',
	'references/leagues',

], function($, _, Backbone, windowView, tpl, messages, leagues) {

	var View = windowView.extend({

		/** @cfg */
		title: messages.getByKey('window_title_rating'),
		data: [],

		initialize: function(config) {
			config.height = 500;
			config.content = _.template(tpl)({user: APP.user.attributes, messages: messages, leagues: leagues, data: config.data});
			windowView.prototype.initialize.apply(this, arguments);
		},
	});

	return View;
});