/**
 * Сервис управления энергией
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var _ = require('underscore');

var Service = function() {
	var me = this;
	//
}

Service.prototype.freeEnergy = function(userModel, callback) {
	var me = this,
		now = new Date();
	userModel.addons.buffs.setExpired('free_energy', new Date(now.getTime() + config.free_energy_period*60000));
	userModel.save(function(err) {
		callback(err);
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