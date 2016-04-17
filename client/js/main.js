// Настройки requirejs

require.config({
	baseUrl: 'js/app',
	paths: {
		'jquery': '../vendor/jquery/dist/jquery',
		'underscore': '../vendor/underscore/underscore',
		'backbone': '../vendor/backbone/backbone',
		'backbone.babysitter': '../vendor/lib/backbone.babysitter',
		'backbone.wreqr': '../vendor/lib/backbone.wreqr',
		'marionette': '../vendor/marionette/lib/backbone.marionette',
		'text': '../vendor/text/text',
		'socket.io': '../vendor/socket.io-client/socket.io',		
		'references': '/js/references/ru'
	}
});

/**
 * Инициализация приложения
 */

var Game = {};

require(['jquery', 'app/app',], function($, App){
	$(function() {
		Game = App.initialize(config); // config - глобальный конфиг от сервера
	});
});