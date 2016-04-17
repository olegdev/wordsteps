/**
 * Авторизационные данные
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
	//
}

Addon.prototype.getConfig = function() {
	if (this.get('vkId')) {
		return {vkId: this.get('vkId')};
	} else {
		return {email: true};
	}
}

Addon.prototype.get = function(key) {
	var me = this,
		data = me.model.get('auth');
	return key ? data[key] : data;
}

Addon.prototype.set = function(key, value) {
	var me = this,
		data = me.model.get('auth');
	if (key) {
		data[key] = value;	
	} else {
		data = value;
	}
	me.model.set('auth', _.clone(data));
}

module.exports = Service;