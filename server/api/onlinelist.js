/**
 * API онлайн листа
 */
var socketsService = require(SERVICES_PATH + '/sockets');

var API = function() {
	var me = this;

	me.service = require(SERVICES_PATH + '/onlinelist/onlinelist');
	me.service.api = me;

	me.channel = socketsService.createChannel('onlinelist');
	me.channel.on('get_online', me.cmdGetOnlineList, me);
}

//============== API commands ==============

API.prototype.cmdGetOnlineList = function(userModel, params, callback) {
	var me = this,
		list = [];

	Object.keys(me.service.list).forEach(function(uid) {
		list.push(me.service.list[uid].asJson('info;counters;'));
	});

	callback(list);
}

API.prototype.pushUserUpdate = function(userModel) {
	var me = this;
	me.channel.push(userModel.id, 'user_update', userModel.asJson('counters;buffs;timed;'));
}

// Создает только один экземпляр класса
API.getInstance = function(){
    if (!this.instance) {
    	this.instance = new API();
    }
    return this.instance;
}

module.exports = API.getInstance();