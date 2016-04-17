/**
 * API сервиса энергии
 */
var socketsService = require(SERVICES_PATH + '/sockets');
var _ = require('underscore');
var messages = require(SERVICES_PATH + '/references/messages/messages');

var API = function() {
	var me = this;

	me.service = require(SERVICES_PATH + '/energy/energy');
	me.service.api = me;

	me.channel = socketsService.createChannel('energy');
	me.channel.on('free_energy', me.cmdFreeEnergy, me);

	me.errorChannel = socketsService.createChannel('error');
}

//============== API commands ==============

API.prototype.cmdFreeEnergy = function(userModel, data, callback) {
	var me = this;
	me.service.freeEnergy(userModel, function(err) {
		if (!err) {
			callback();
		} else {
			me.errorChannel.push('error', err);
		}
	});
}

// Создает только один экземпляр класса
API.getInstance = function(){
    if (!this.instance) {
    	this.instance = new API();
    }
    return this.instance;
}

module.exports = API.getInstance();