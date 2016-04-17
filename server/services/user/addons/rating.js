/**
 * Рейтинг игрока (лига, кол-во очков, место)
 */
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require("mongoose");
var _ = require("underscore");

var messagesRef = require(SERVICES_PATH + '/references/messages/messages');
var ratingService = require(SERVICES_PATH + '/rating/rating');

var Service = {
	factory: function(model) {
		return new Addon(model);
	}
}

/**
 * Класс аддона
 */
var Addon = function(model) {
	this.model = model;
}

Addon.prototype.init = function() {
	this.set('league', 1);
	this.set('points', 0);
}

Addon.prototype.getConfig = function() {
	return this.get();
}

Addon.prototype.get = function(key) {
	var me = this,
		data = me.model.get('rating'),
		place,
		totalPlaces;

	// виртуальное поле "place"
	place = _.findIndex(ratingService.rating[data.league], function(u) {
		return u.id == me.model.id;
	});

	place += 1;
	totalPlaces = ratingService.rating[data.league].length;

	if (!place) {
		data.place = messagesRef.getByKey('place_no');
	} else if (place < 99) {
		data.place = place + ' ' + messagesRef.getByKey('place_title');
	} else if (place / totalPlaces <= 0.1) {
		data.place = messagesRef.getByKey('place_top_10');
	} else if (place / totalPlaces <= 0.3) {
		data.place = messagesRef.getByKey('place_top_30');
	} else if (place / totalPlaces <= 0.5) {
		data.place = messagesRef.getByKey('place_top_50');
	} else {
		data.place = messagesRef.getByKey('place_under_50');
	}

	return key ? data[key] : data;
}

Addon.prototype.set = function(key, value) {
	var me = this,
		data = me.model.get('rating');
	data[key] = value;	
	me.model.set('rating', _.clone(data));
}

Addon.prototype.addPoints = function(points) {
	var me = this;
	me.set('points', Math.max(me.get('points') + points,0));
}

module.exports = Service;