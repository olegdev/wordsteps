/*** Нижнее поле с буквами */
define([
	'jquery',
	'underscore',
	'backbone',

	'battle/views/battle_side2',
	'battle/views/word',
	'text!battle/templates/side1.tpl',
	'references/messages',
], function($, _, Backbone, BackboneSide2View, WordView, tpl, messages) {

	var View = BackboneSide2View.extend({

		defaultAngleOfLettersRotation: 0,
		template: _.template(tpl),

		events: {
			'click .letter': 'onLetterClick',
		},

		render: function() {
			var me = this;

			BackboneSide2View.prototype.render.apply(this, arguments);

			this.wordView = new WordView({
				letters: this.config.letters,
			});
			this.wordView.on('submit', _.bind(this.onWordSubmit, this));
			this.wordView.on('clear', _.bind(this.onWordClear, this));

			setTimeout(function() {
				me.$el.parent().append(me.wordView.$el);
			}, 0);

			return this;
		},

		onLetterClick: function(e) {
			var me = this,
				$el = $(e.currentTarget);

			if ($el.hasClass('submit')) {
				return;
			}

			if ($el.hasClass('selected')) {
				this.wordView.removeLetter($el.attr('data-id'));
			} else {
				this.wordView.addLetter($el.attr('data-id'));
			}

			this.$el.find('.letter').removeClass('selected');
			this.wordView.word.forEach(function(item) {
				me.$el.find('.letter[data-id="'+ item.id +'"]').addClass('selected');
			});
		},

		onWordSubmit: function(word) {
			this.$el.find('.selected').removeClass('selected').each(function() {
				$(this).addClass('src-anim');
			});

			this.trigger('submit', word);
		},

		onWordClear: function(word) {
			this.$el.find('.selected').removeClass('selected');
		},

		/**** Анимация источника */
		showSourceHit: function(data, callback) {
			var me = this;

			// смещаю буквы на своем поле
			_.each(me.config.letters, function(value) {
				if (data.src[value.id] && data.src[value.id].row != value.row) {
					me.$el.find('.letter[data-id="'+ value.id +'"]').css('top', ((me.config.fieldSize.rows-1-data.src[value.id].row) * me.cellHeight) + 'px');
				}
			});

			// показываю новые буквы
			setTimeout(function() {
				_.each(data.src, function(value) {
					if (!me.config.letters[value.id]) {
						var el = $('<div class="letter">'+ value.letter +'</div>');
						el.attr('data-id', value.id);
						el.css({
							top: ((me.config.fieldSize.rows-1-data.src[value.id].row) * me.cellHeight) +'px',
							left: (value.column * me.cellWidth) + 'px',
							display: 'none',
						});
						me.$el.find('.field-inner').append(el);
						el.fadeIn();
					}
				});

				me.config.letters = data.src;
				me.wordView.config.letters = me.config.letters;

			}, 200);

			// пауза и удаляю все буквы удара и вызываю коллбек
			setTimeout(function() {
				me.$el.find('.src-anim').remove();
			}, 2000);

			callback();

		},

		/**** Анимация приёмника */
		showDestHit: function(data, callback) {
			var me = this;

			// нахожу буквы удара и располагаю их за полем, и затем смещаю в ячейки
			_.each(data.dest, function(value) {
				if (!me.config.letters[value.id]) {
					var el = $('<div class="letter dest-anim">'+ value.letter +'</div>');
					el.attr('data-id', value.id);
					el.css({
						left: (value.column * me.cellWidth) + 'px',
					});
					me.$el.find('.field-inner').append(el);
					(function(el,value) {
						setTimeout(function() {
							el.css('top', ((me.config.fieldSize.rows-1-data.dest[value.id].row) * me.cellHeight) + 'px');

							// скидываю цвет
							setTimeout(function() {
								el.removeClass('dest-anim');
							}, 900);

						},200);
					}(el,value));
				}
			});

			me.config.letters = data.dest;
			me.wordView.config.letters = me.config.letters;

			callback();
		},

		unsmashLetters: function() {
			var me = this;
			_.each(me.config.letters, function(value) {
				me.$el.find('.letter[data-id="'+ value.id +'"]').css({
					top: ((me.config.fieldSize.rows-1-value.row) * me.cellHeight),
					left: value.column * me.cellWidth,
					transform: 'rotate('+ me.defaultAngleOfLettersRotation +'deg)',
				});
			});
		},

	});

	return View;
});