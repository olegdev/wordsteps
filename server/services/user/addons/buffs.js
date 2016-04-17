/**
 * Баффы
 */
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require("mongoose");
var _ = require("underscore");

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
	this.set(null, {});
}

Addon.prototype.getConfig = function() {
	return this.model.get('buffs');
}

Addon.prototype.get = function(key) {
	var me = this,
		data = me.model.get('buffs');
	return key ? data[key] : data;
}

Addon.prototype.set = function(key, value) {
	var me = this,
		data = _.clone(me.model.get('buffs'));
	if (key) {
		data[key] = value;	
	} else {
		data = value;	
	}
	me.model.set('buffs', data);
}

Addon.prototype.setExpired = function(key, dateOfExpiration) {
	var me = this,
		data = _.clone(me.model.get('buffs'));
	data[key] = {
		expired: dateOfExpiration
	};
	me.model.set('buffs', data);
}

module.exports = Service;