/**
 * Модуль энергетический.
 *
 */
define([
	'jquery',
	'underscore',
	'backbone',
	
	'sockets/sockets',
	'session/session',
	'social/social',

	'references/messages',

	'energy/views/energy_window',

], function($, _, Backbone, sockets, session, social, messages, EnergyWindowView) {

	var channel = sockets.createChannel('energy'),
		win;

	/** API listeners */
	/** ***** **/

	/*** Показать окно восстановления энергии */
	var showWindow = function(config) {
		win = new EnergyWindowView(config || {});
		win.on('free-energy', function() {
			freeEnergy(function() {
				channel.push("free_energy", {}, function() {
					// update user view
				});
				win.close();
			})
		});
		win.on('money-energy', function() {
			moneyEnergy(function() {
				win.close();
			})
		});
	}

	var freeEnergy = function(callback) {
		social.wallPost('vk_messages_image.jpg', messages.getByKey("vk_wallpost_message"), function() {
			callback();
		})
	}

	var moneyEnergy = function(callback) {
		social.order('free_energy');
		callback();
	}

	return {
		showWindow: function(config) {
			showWindow(config);
		}
	};
});