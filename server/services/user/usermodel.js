/**
 * Сервис модели юзера.
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require("mongoose");
var fs = require('fs');
var events = require('events');
var util = require('util');

var Service = function() {
	var me = this;
	me.addons = {};
	// подключаю все доступные аддоны
	config.addons.forEach(function(addonName) {
		if (fs.existsSync(__dirname + '/addons/' + addonName + '.js')) {
			me.addons[addonName] = require(__dirname + '/addons/' + addonName);
		} else {
			/****/ logger.warn('usermodel@constructor Cannot find addon file', addonName);
		}
	});
}

Service.prototype.factory = function(model) {
	var me = this,
		addons = {},
		init = false,
		modelClass = mongoose.model('users');

	if (!model) {
		init = true;
		model = new modelClass({});
	}

	Object.keys(me.addons).forEach(function(addonName) {
		addons[addonName] = me.addons[addonName].factory(model);
		if (init) {
			addons[addonName].init();
		}
	});

	return new UserModel(model, addons);
}

/**
 * Класс модели
 */
var UserModel = function(model, addons) {
	this.id = model.id;
	this.model = model;
	this.addons = addons;
	events.EventEmitter.call(this);
}

util.inherits(UserModel, events.EventEmitter);

UserModel.prototype.getConfig = function(callback) {
	var me = this,
		config = {
			id: me.id,
		};

	Object.keys(me.addons).forEach(function(addonName) {
		if (typeof me.addons[addonName].getConfig == 'function') {
			config[addonName] = me.addons[addonName].getConfig();
		} else {
			/****/ logger.warn('usermodel@getConfig Addon "' + addonName + '" does not provide method getConfig');	
		}
	});

	callback(null, config);
}

UserModel.prototype.asJson = function(path) {
	var me = this,
		addons = {},
		result = {
			id: me.id,
		};

	path.split(';').forEach(function(addonPath) {
		if (addonPath) {
			var parts = addonPath.split(':');
			if (parts.length > 1) {
				addons[parts.shift()] = parts[0].split(',');
			} else {
				addons[addonPath] = [];
			}
		}
	});

	Object.keys(addons).forEach(function(addonName) {
		if (me.addons[addonName] && typeof me.addons[addonName].get == 'function') {
			if (addons[addonName].length) {
				result[addonName] = {};
				addons[addonName].forEach(function(key) {
					result[addonName][key] = me.addons[addonName].get(key);
				});
			} else {
				result[addonName] = me.addons[addonName].get();
			}
		} else {
			/****/ logger.warn('usermodel@get Unknown addon "' + addonName + '" or addon does not provide method get');	
		}
	});

	return result;
}

/*** Сохраняет изменения модели в базе, генерирует событие "save" */
UserModel.prototype.save = function(callback) {
	var me = this;
	me.model.save(function(err) {
		if (!err) {
			me.emit('save');
			callback(null);
		} else {
			callback(error.factory('Usermodel', 'save', 'Cannot save user model ' + err, logger));
		}
	});
}

UserModel.prototype.get = function(addonName, key) {
	var me = this;

	if (me.addons[addonName] && typeof me.addons[addonName].get == 'function') {
		return me.addons[addonName].get(key);
	} else {
		/****/ logger.warn('usermodel@get Unknown addon "' + addonName + '" or addon does not provide method get');	
	}
}

UserModel.prototype.set = function(addonName, key, value) {
	var me = this;

	if (me.addons[addonName] && typeof me.addons[addonName].set == 'function') {
		me.addons[addonName].set(key, value);
	} else {
		/****/ logger.warn('usermodel@get Unknown addon "' + addonName + '" or addon does not provide method set');	
	}
}

// Создает только один экземпляр класса
Service.getInstance = function(){
    if (!this.instance) {
    	this.instance = new Service();
    }
    return this.instance;
}

module.exports = Service.getInstance();