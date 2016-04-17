/**
 * Модуль боя.
 *
 */
define([
	'jquery',
	'underscore',
	'backbone',
	'sockets/sockets',

	'session/session',
	'location/location',

	'battle/battle_hits',
	'battle/views/battle_container',
	'battle/views/battle_result_window',

], function($, _, Backbone, sockets, session, LocationService, BattleHits, BattleContainerView, ResultWindowView) {

	var channel = sockets.createChannel('battle');

	/*** API listeners */
	channel.on('start', function(data) {
		showBattle(data);
	});
	channel.on('hit', function(data) {
		processHit(data);
	});
	channel.on('finish', function(data) {
		showFinish(data);
	});

	/*** Старт боя */
	var showBattle = function(data) {
		var side1, side2;

		if (data.battle.sides[0].u.id == APP.user.attributes.id) {
			side1 = data.battle.sides[0];
			side2 = data.battle.sides[1];
		} else {
			side1 = data.battle.sides[1];
			side2 = data.battle.sides[0];
		}

		battleContainerView = new BattleContainerView({
			side1: side1,
			side2: side2,
			fieldSize: data.battle.fieldSize,
		});

		battleContainerView.on('submit', function(word) {
			channel.push('word', {word: word});
		});

		BattleHits.init(battleContainerView);

		time = 60;
		setInterval(function() {
			$('.vs-sign').html(time--);
			if (time < 0) {
				time = 60;
			}
		}, 1000);

	}

	/*** Пришел удар */
	var processHit = function(data) {
		BattleHits.processHit(data.hit);
		battleContainerView.battleLog.addMessage(data.hit.word);

		time = 60;
	}

	/*** Показываю последний удар и окно результата */
	var showFinish = function(data) {
		var me = this;

		BattleHits.processHit(data.hit, function() {
			// обновляю данные игрока
			APP.user.set(data.user);

			// останавливаю мониторинг ударов
			BattleHits.stopMonitor();

			// обновляю данные сессии
			if (data.hit.owner_id == APP.user.attributes.id) {
				session.set('win_counts', (session.get('win_counts') || 0) + 1);
				session.set('rating', (session.get('rating') || 0) + data.result.pointsWin);
			} else {
				session.set('lose_counts', (session.get('lose_counts') || 0) + 1);
				session.set('rating', (session.get('rating') || 0) - data.result.pointsLose);
			}

			// отрисовываю локацию
			LocationService.render();

			// показываю результат
			new ResultWindowView({
				data: data.result,
			});
		});
	}

	return {
		loadAndShow: function() {
			channel.push('get_battle', {}, function(data) {
				showBattle(data);
			});
		}
	};
});