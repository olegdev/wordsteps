/**
 * Сессия
 */
define([
	'jquery',
	'underscore',
	'backbone',
], function($, _, Backbone) {
	
	var session = {};

	return {
		get: function(key) {
			return session[key];
		},
		set: function(key, value) {
			session[key] = value;
		}
	};
});