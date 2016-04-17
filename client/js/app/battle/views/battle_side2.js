/*** Верхнее поле с буквами */
define([
	'jquery',
	'underscore',
	'backbone',
	'text!battle/templates/side2.tpl',
	'references/messages',
], function($, _, Backbone, tpl, messages) {

	var View = Backbone.View.extend({

		className: 'field',
		cellWidth: 41 + 5,
		cellHeight: 41 + 5,
		defaultAngleOfLettersRotation: 0,

		template: _.template(tpl),

		// @cfg
		// fieldSize
		// letters - буквы
		initialize: function(config) {
			this.config = config;
		},

		render: function() {
			this.$el.html(this.template({
				fieldSize: this.config.fieldSize,
				field: this.getField(),
				cellWidth: this.cellWidth,
				cellHeight: this.cellHeight,
				messages: messages
			}));
			return this;
		},

		getField: function() {
			var me = this,
				field = [];

			for(var i = 0; i < this.config.fieldSize.rows; i++) {
				field.push(new Array(5));
			}

			_.each(this.config.letters, function(value) {
				field[value.row][value.column] = value;
			});

			return field;
		},

		/**** Анимация источника */
		showSourceHit: function(data, callback) {
			var me = this;

			// нахожу все буквы, которых нет в данных источника (буквы удара) и подкрашиваю в зеленый
			_.each(me.config.letters, function(value) {
				if (!data.src[value.id]) {
					me.$el.find('.letter[data-id="'+ value.id +'"]').addClass('submit');
				}
			});

			// пауза и затем смещаю их вниз
			setTimeout(function() {
				// смещаю вниз
				me.$el.find('.submit').addClass('src-anim2');

				// смещаю остальные буквы на своем поле
				_.each(me.config.letters, function(value) {
					if (data.src[value.id] && data.src[value.id].row != value.row) {
						me.$el.find('.letter[data-id="'+ value.id +'"]').css('top', (data.src[value.id].row * me.cellHeight) + 'px');
					}
				});

				// показываю новые буквы
				setTimeout(function() {
					_.each(data.src, function(value) {
						if (!me.config.letters[value.id]) {
							var el = $('<div class="letter">'+ value.letter +'</div>');
							el.attr('data-id', value.id);
							el.css({
								top: (value.row * me.cellHeight ) +'px',
								left: (value.column * me.cellWidth) + 'px',
								display: 'none',
							});
							me.$el.find('.field-inner').append(el);
							el.fadeIn();
						}
					});

					me.config.letters = data.src;

				}, 200);

				// пауза и удаляю все буквы удара и вызываю коллбек
				setTimeout(function() {
					me.$el.find('.submit').remove();
				}, 1000);

				callback();

			}, 500);

		},

		/**** Анимация приёмника */
		showDestHit: function(data, callback) {
			var me = this;

			// нахожу буквы удара и располагаю их за полем, и затем смещаю в ячейки
			_.each(data.dest, function(value) {
				if (!me.config.letters[value.id]) {
					var el = $('<div class="letter dest-anim2">'+ value.letter +'</div>');
					el.attr('data-id', value.id);
					el.css({
						left: (value.column * me.cellWidth) + 'px',
					});
					me.$el.find('.field-inner').append(el);
					(function(el,value) {
						setTimeout(function() {
							el.css('top', (data.dest[value.id].row * me.cellHeight) + 'px');

							// скидываю цвет
							setTimeout(function() {
								el.removeClass('dest-anim2');
							}, 900);

						},200);
					}(el,value));
				}
			});

			me.config.letters = data.dest;

			callback();
		},

		/*** Размывание букв на поле */
		startBlurLetters: function() {
			var me = this;

			if (me.bluringInterval) {
				return;
			}

			var els = me.$el.find('.letter'),
				blurValue = 9,
				blurDir = 1,
				originalColor = els.css('color');

			els.css({
				'color': 'transparent',
				'text-shadow': '0 0 9px rgba(68,68,68,0.5)'
			});

			me.bluringInterval = setInterval(function() {
				if (me.stopBluringCallback) {
					if (blurValue-- == 0) {
						clearInterval(me.bluringInterval);
						me.bluringInterval = null;
						els.css({
							'color': originalColor,
							'text-shadow': 'none'
						});
						me.stopBluringCallback();
						me.stopBluringCallback = null;
						return;
					}
				} else {
					if (blurDir == 1) {
						blurValue++;
					} else {
						blurValue--;
					}
					if (blurValue == 15) {
						blurDir = 0;
					} else if (blurValue == 7) {
						blurDir = 1;
					}
				}
				els.css('text-shadow', '0 0 '+ blurValue +'px rgba(68,68,68,0.5)');
			}, 125);
		},

		/*** Пректарить размывание */
		stopBlurLetters: function(callback) {
			var me = this;
			me.stopBluringCallback = callback;
		},

		/*** Тармошим буквы */
		smashLetters: function() {
			var me = this;

			var els = me.$el.find('.letter');

			els.each(function() {
				var el = $(this),
					top = parseInt(el.css('top')),
					left = parseInt(el.css('left'));

				top += _.random(-30, 30);
				left += _.random(-30, 30);

				if (top < 0) {
					top = 0;
				} else if (top > 244) {
					top = 244;
				}

				if (left < 10) {
					left = 10;
				} else if (left > 240) {
					left = 240;
				}

				$(this).css({
					top:  top,
					left: left,
					transform: 'rotate('+ _.random(0,30) +'deg)',
				});
			});
		},

		unsmashLetters: function() {
			var me = this;
			_.each(me.config.letters, function(value) {
				me.$el.find('.letter[data-id="'+ value.id +'"]').css({
					top: value.row * me.cellHeight,
					left: value.column * me.cellWidth,
					transform: 'rotate('+ me.defaultAngleOfLettersRotation +'deg)',
				});
			});

		},

		animFinish: function(callback) {
			var me = this;

			var els = me.$el.find('.letter');

			els.addClass('finished');
			els.each(function() {
				var el = $(this),
					left;
				if (!el.hasClass('dest-anim') && !el.hasClass('dest-anim2') ) {
					left = parseInt(el.css('left')) + _.random(-100, 100);
				}
				el.css({
					top:  _.random(350, 500) +'px',
					left: left,
					transform: me.defaultAngleOfLettersRotation +  'rotate('+ _.random(-30,30) +'deg)',
				});
			});

			setTimeout(function() {
				callback();
			}, 1000);
			
		},

	});

	return View;
});