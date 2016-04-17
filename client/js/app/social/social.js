/**
 * Модуль соц.сети.
 *
 */
define([
	'jquery',
	'underscore',
	'backbone',
	
	'sockets/sockets',
	'session/session',
	'social/vk',

	'references/messages',

], function($, _, Backbone, sockets, session, vk) {

	var socialApi;

	if (config.user.auth.vkId) {
		socialApi = vk;
	}

	return {

		isSocialUser: function() {
			return socialApi ? true : false;
		},

		init: function() {
			socialApi.init();
		},

		wallPost: function(image, message, callback) {
			socialApi.wallPost.apply(socialApi, arguments);			
		},

		order: function(itemName) {
			socialApi.order.apply(socialApi, arguments);
		}
	};
});