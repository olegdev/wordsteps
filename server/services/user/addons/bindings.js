/**
 * Привязки игрока
 */
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require("mongoose");
var _ = require("underscore");

var Service = {
	factory: function() {
		return new Addon();
	}
}

/**
 * Класс аддона
 */
var Addon = function() {
	this.bindings = {};
}

Addon.prototype.init = function() {
	//
}

Addon.prototype.getConfig = function() {
	return this.get();
}

Addon.prototype.get = function(key) {
	return key ? this.bindings[key] : this.bindings;
}

Addon.prototype.set = function(key, value) {
	var me = this;
	if (key) {
		me.bindings[key] = value;
	} else {
		me.bindings = value;
	}
}

module.exports = Service;