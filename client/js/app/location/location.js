/**
 * Модуль локации.
 *
 */
define([
	'jquery',
	'underscore',
	'backbone',
	'energy/energy',
	'rating/rating',
	'battle_search/battle_search',
	'location/views/info',
	'location/views/controls',
	'location/views/window',
	'text!location/templates/main.tpl',
	'references/messages'
], function($, _, Backbone, energy, rating, battleSearch, InfoView, ControlsView, windowView, mainTpl, messages) {

	var onFightClick = function() {
		if (APP.user.get('timed').energy[0] < 1 && !APP.user.get('buffs').free_energy) {
			energy.showWindow({ hint: true });
		} else {
			battleSearch.search();
		}
	}

	var onRatingClick = function() {
		rating.showWindow();
	}

	var onTournamentClick = function() {
		//
	}

	return {
		render: function() {

			$(document.body).html(_.template(mainTpl)({messages: messages}));

			var infoView = new InfoView({
				el: $('#infoview-box'),
			});

			var controlsView = new ControlsView({
				el: $('#controlsview-box'),
				events: {
					'click #fight-btn': onFightClick,
					'click #rating-btn': onRatingClick,
					'click #tournament-btn': onTournamentClick,
				},
			});

			infoView.render();
			controlsView.render();
		}
	};
});