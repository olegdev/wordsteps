/**
 * Сервис восстанавливаемых характеристик. Запускает интервал обновления хар-к пользователей
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require('mongoose');
var _ = require('underscore');

var Service = function() {
	var me = this;

	me.interval = setInterval(function() {
		me.refreshValues(function() {});
	}, 1*60*1000);

}

// Обновляет значения восстанавливаемых характеристик
Service.prototype.refreshValues = function(callback) {
	var me = this,
		newValue,
		user;

	mongoose.model('users').find({}, function(err, users) {
		if (err) {
			callback(error.factory('timed', 'refreshValues', 'DB error ' + err, logger));
		} else {
			for(var i = 0; i < users.length; i++) {
				user = users[i];
				newValue = {};				
				_.each(user.get('timed'), function(v,k) {
					if (v[0] < v[1]) {
						newValue[k] = [v[0] + v[2], v[1], v[2]];
					}
				});
				if (!_.isEmpty(newValue)) {
					user.set('timed', newValue);
					user.save(function(err) {
						if (err) {
							callback(error.factory('timed', 'refreshValues', 'Cannot save user model ' + err, logger));
						}
					});
				}
			}
			callback(null);
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