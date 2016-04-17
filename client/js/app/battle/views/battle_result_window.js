/*** Окно результатов */
define([
	'jquery',
	'underscore',
	'backbone',

	'sound/sound',

	'location/views/window',
	'location/views/opponents',
	'text!battle/templates/battle_result_window.tpl',
	'references/messages',
	'references/leagues',
], function($, _, Backbone, sound, windowView, opponentsView, tpl, messages, leagues) {

	var View = windowView.extend({

		// @cfg 
		// data - результат боя
		initialize: function(config) {
			var me = this,
				side1, side2;

			this.config = config;

			// определяю данные сторон
			if (this.config.data.battle.sides[0].u.id == APP.user.attributes.id) {
				side1 = this.config.data.battle.sides[0];
				side2 = this.config.data.battle.sides[1];
			} else {
				side1 = this.config.data.battle.sides[1];
				side2 = this.config.data.battle.sides[0];
			}

			// заголовок
			if (side1.isWin) {
				this.title = messages.getByKey('window_title_battle_resul_win');
			} else {
				this.title = messages.getByKey('window_title_battle_resul_lose');
			}

			config.content = _.template(tpl)({result: config.data, isWin: side1.isWin, user: side1.u, enemy: side2.u, messages: messages, leagues: leagues, opponentsView: opponentsView});
			windowView.prototype.initialize.apply(this, arguments);

			// sound.play('win');
		},

	});

	return View;
});