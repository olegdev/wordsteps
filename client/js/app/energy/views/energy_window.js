/*** Окно восстановления энергии */
define([
	'jquery',
	'underscore',
	'backbone',

	'location/views/window',
	'location/views/money',
	'text!energy/templates/energy_window.tpl',
	
	'references/messages',

], function($, _, Backbone, windowView, moneyView, tpl, messages) {

	var View = windowView.extend({

		/** @cfg */
		title: messages.getByKey('window_title_energy'),
		hint: false,

		events: {
			'click .window-close' : 'close',
			'click #free-energy-btn': 'onFreeEnergyClick',
			'click #money-energy-btn': 'onMoneyEnergyClick',
		},

		initialize: function(config) {
			config.content = _.template(tpl)({user: APP.user.attributes, messages: messages, hint: config.hint, moneyView: moneyView});
			windowView.prototype.initialize.apply(this, arguments);
		},

		onFreeEnergyClick: function() {
			this.trigger('free-energy');
		},

		onMoneyEnergyClick: function() {
			this.trigger('money-energy');
		}

	});

	return View;
});