/*** Инфо о юзере */
define([
	'jquery',
	'underscore',
	'backbone',

	'session/session',

	'text!location/templates/views/info.tpl',
	'location/views/user_avatar',
	'references/messages',
	'references/leagues',

	'energy/energy',

], function($, _, Backbone, session, tpl, userAvatarView, messages, leagues, energy) {

	var View = Backbone.View.extend({

		template: _.template(tpl),

		events: {
			'click .add-energy-btn': 'onAddEnergyClick',
		},

		initialize: function() {
			this.listenTo(APP.user, "change", this.render);
		},

		render: function() {
			this.$el.html(this.template({data: APP.user.attributes, session: session, messages: messages, leagues: leagues, userAvatarView: userAvatarView}));
			return this;
		},

		onAddEnergyClick: function() {
			energy.showWindow();
		}
	});

	return View;
});