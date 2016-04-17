/**
 * Сервис баффов
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require('mongoose');
var _ = require('underscore');

var userService = require(SERVICES_PATH + '/user/user');

var Service = function() {
	var me = this;

	me.interval = setInterval(function() {
		me.refreshValues(function() {});
	}, 1*60*1000);

}

// Обновляет баффы игроков
Service.prototype.refreshValues = function(callback) {
	var me = this,
		changed,
		newValue,
		now = new Date();

	userService.find({}, function(err, userModels) {
		if (!err) {
			_.each(userModels, function(userModel) {
				changed = false;
				newValue = _.clone(userModel.get('buffs'));
				_.each(userModel.get('buffs'), function(v,k) {
					if (v && v.expired && v.expired < now) {
						delete newValue[k];
						changed = true;
					}
				});
				if (changed) {
					userModel.set('buffs', null, newValue);
					userModel.model.save(function(err) {
						if (err) {
							callback(error.factory('buffs', 'refreshValues', 'Cannot save user model ' + err, logger));
						}
					});
				}
			});
			callback(null);
		} else {
			callback(error.factory('buffs', 'refreshValues', 'UserService find error ' + err, logger));
		}
	});
}

// Создает только один экземпляр класса
Service.getInstance = function() {
    if (!this.instance) {
    	this.instance = new Service();
    }
    return this.instance;
}

module.exports = Service.getInstance();