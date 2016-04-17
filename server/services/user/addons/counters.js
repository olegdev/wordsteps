/**
 * Счетчики (key-value хеш)
 */
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require("mongoose");
var _ = require('underscore');

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
	this.set('wins', 0);
	this.set('loses', 0);
}

Addon.prototype.getConfig = function() {
	return this.model.get('counters');
}

Addon.prototype.get = function(key) {
	var me = this,
		data = me.model.get('counters');
	return key ? data[key] : data;
}

Addon.prototype.set = function(key, value) {
	var me = this,
		data = me.model.get('counters');
	data[key] = value;	
	me.model.set('counters', _.clone(data));
}

Addon.prototype.incValue = function(key) {
	var me = this;
	me.set(key, me.get(key) + 1);
}

module.exports = Service;