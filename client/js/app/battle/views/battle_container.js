/*** Окно перед боем */
define([
	'jquery',
	'underscore',
	'backbone',
	'sound/sound',
	'battle/views/battle_side1',
	'battle/views/battle_side2',
	'battle/views/battle_log',
	'location/views/opponents',
	'text!battle/templates/battle_container.tpl',
	'references/messages',
], function($, _, Backbone, sound, BattleSide1View, BattleSide2View, BattleLogView, OpponentsView, tpl, messages) {

	var View = Backbone.View.extend({

		isBusy: false, // признак занятости (выставляется перед анимацией удара)

		// @cfg
		// side1
		// side2
		// fieldSize
		initialize: function(config) {
			this.config = config;
			this.render();
		},

		render: function() {
			var me = this;

			$(document.body).html(_.template(tpl)({
				opponents: OpponentsView.print(this.config.side1.u, this.config.side2.u),
			}));

			this.side1Field = new BattleSide1View({
				fieldSize: this.config.fieldSize,
				letters: this.config.side1.letters,
			});

			this.side2Field = new BattleSide2View({
				fieldSize: this.config.fieldSize,
				letters: this.config.side2.letters,
			});
			this.side1Field.on('submit', function(word) {
				me.trigger('submit', word);
			});

			$('#battle-side1').append(this.side1Field.render().$el);
			$('#battle-side2').append(this.side2Field.render().$el);

			this.battleLog = new BattleLogView();
			$('#battle-log').append(this.battleLog.render().$el);

		},

		/**
		 * Показ удара
		 */
		showHit: function(data) {
			var me = this,
				field1, field2;

			me.isBusy = true;

			// определяю чей лог пришел
			if (me.config.side1.u.id == data.owner_id) {
				field1 = me.side1Field;
				field2 = me.side2Field;
			} else {
				field1 = me.side2Field;
				field2 = me.side1Field;
			}

			// показываю анимацию источника
			field1.showSourceHit(data, function() {

				// показываю анимацию приёмника
				field2.showDestHit(data, function() {
					setTimeout(function() {

						if (data.finished) {
							sound.play('hit_finished');
							field2.animFinish(function() {
								me.isBusy = false;	
							});
						} else if (data.quality == 1) {
							// звук удара 
							sound.play('hit_1');
							me.isBusy = false;
						} else if (data.quality == 2) {
							sound.play('hit_' + data.quality);
							field2.startBlurLetters();
							setTimeout(function() {
								field2.stopBlurLetters(function() {
									//
								});
								me.isBusy = false;
							}, 1000);
						} else {
							sound.play('hit_1');
							// звук качественного удара
							setTimeout(function() {
								sound.play('hit_' + data.quality);
							}, 200);

							field2.startBlurLetters();
							field2.smashLetters();
							
							setTimeout(function() {
								field2.stopBlurLetters(function() {
									//
								});
								field2.unsmashLetters();
								me.isBusy = false;
							}, 1500);
						}
					}, 200);
				});
			});
		},

	});

	return View;
});