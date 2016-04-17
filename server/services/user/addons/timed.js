/**
 * Восстанавливаемые характеристики
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
	this.set('energy', [5,5,0.01667]);
}

Addon.prototype.getConfig = function() {
	return this.model.get('timed');
}

Addon.prototype.get = function(key) {
	var me = this,
		data = me.model.get('timed');
	return key ? data[key] : data;
}

Addon.prototype.set = function(key, value) {
	var me = this,
		data = me.model.get('timed');
	data[key] = value;	
	me.model.set('timed', _.clone(data));
}

Addon.prototype.decValue = function(key) {
	var me = this,
		current = me.get(key);
	me.set(key, [Math.max(current[0]-1, 0), current[1], current[2]]);
}

module.exports = Service;