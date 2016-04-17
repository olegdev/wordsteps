/**
 * Модуль поиска противника.
 *
 */
define([
	'jquery',
	'underscore',
	'backbone',
	
	'sockets/sockets',
	'session/session',
	'dictionary/dictionary',

	'references/messages',
	'references/hints',

	'battle_search/views/search_window',
	'location/views/user_avatar',

], function($, _, Backbone, sockets, session, dictionary, messages, hints, SearchWindowView) {

	var channel = sockets.createChannel('battle_search'),
		win;

	/** API listeners */
	channel.on('enemy', function(data) {
		onCmdEnemy(data);
	});

	/*** Показать окно поиска */
	var showWindow = function() {
		win = new SearchWindowView({
			//
		});
		win.on('close', function() {
			win = undefined;
			channel.push('cancel', {});
		});

		win.showMessage(hints.getRandomFromGroup(1));
	}

	/** поиск противника */
	var search = function() {
		showWindow();
		dictionary.checkUpdate(function() {
			channel.push('search', {});
		});
	}

	// противник найден
	var onCmdEnemy = function(data) {
		if (win) {
			win.showEnemyInfo(data);
		}
	}

	return {
		search: function() {
			search();
		}
	};
});