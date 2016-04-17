/**
 * Модуль словаря
 */
define([
	'jquery',
	'underscore',
	'backbone',
	'sockets/sockets',
	'session/session',
], function($, _, Backbone, sockets, session) {

	var channel = sockets.createChannel('dictionary'),
		dictionary = {};

	// Загружаю из локального хранилища
	if (localStorage.getItem('dictionary')) {
		dictionary = JSON.parse(localStorage.getItem('dictionary'));
	}

	return {
		// проверяет словарь на наличие обновлений и загружает, если нужно
		checkUpdate: function(callback) {
			var me = this;
			if (session.get('dictionary_updated')) {
				callback();
			} else {
				if (dictionary.version) {
					channel.push('get_version', {}, function(data) {
						if (dictionary.version != data.version) {
							me.load(function() {
								callback();
							})
						} else {
							callback();
						}
					});
				} else {
					me.load(function() {
						callback();
					})
				}
			}
		},
		load: function(callback) {
			channel.push('load', {}, function(data) {
				dictionary = data.dictionary;
				callback();
				// сохраняю в локальном хранилище
				localStorage.setItem('dictionary', JSON.stringify(dictionary));
				// запоминаю в сессии
				session.set('dictionary_updated', true);
			});
		},
		checkWord: function(word) {
			return dictionary.words.indexOf(word) != -1;
		}
	};
});