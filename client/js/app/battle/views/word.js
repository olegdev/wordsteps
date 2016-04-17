/*** Контейнер слова */
define([
	'jquery',
	'underscore',
	'backbone',

	'dictionary/dictionary',
	'sound/sound',

	'text!battle/templates/word.tpl',
	'references/messages',
], function($, _, Backbone, dictionary, sound, tpl, messages) {

	var View = Backbone.View.extend({

		id: 'word-container',
		template: _.template(tpl),

		word: [],
		valid: false,

		events: {
			'click li' : 'onWordClick',
			'click .clear-word-btn' : 'onClearClick',
		},

		// @cfg
		// letters - хеш букв игрока
		initialize: function(config) {
			this.config = config;
			
			this.word = [];
			this.valid = false;

			this.render();
		},

		render: function() {
			this.$el.html(this.template({
				word: this.word,
				messages: messages,
			}));
		},

		addLetter: function(id) {
			this.word.push(this.config.letters[id]);
			this.onChange();
			sound.play('click');
		},

		removeLetter: function(id) {
			for(var i = 0; i < this.word.length; i++) {
				if (this.word[i].id == id) {
					break;
				}
			}
			if (i < this.word.length) {
				this.word = this.word.slice(0, i);
			}
			this.onChange();
		},

		onChange: function() {
			var me = this,
				word = '', valid;
			if (this.word.length >= 2) {
				this.word.forEach(function(item) {
					word += item.letter;
				});
				valid = dictionary.checkWord(word);
			} else {
				valid = false;
			}

			if (valid != this.valid) {
				this.valid = valid;
				if (this.valid) {
					this.$el.addClass('valid');
				} else {
					this.$el.removeClass('valid');
				}
			}

			if (this.word.length > 8) {
				this.$el.addClass("more-letters");
			} else {
				this.$el.removeClass("more-letters");
			}

			this.render();
		},

		onWordClick: function() {
			if (this.$el.hasClass('valid')) {
				this.trigger('submit', this.word);
				this.word = [];
				this.onChange();
			}
		},

		onClearClick: function() {
			this.trigger('clear');
			this.word = [];
			this.onChange();			
		}

	});

	return View;
});