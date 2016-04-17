/**
 * API словаря
 */
var socketsService = require(SERVICES_PATH + '/sockets');

var API = function() {
	var me = this;

	me.service = require(SERVICES_PATH + '/dictionary/dictionary');
	me.service.api = me;

	me.channel = socketsService.createChannel('dictionary');
	me.channel.on('get_version', me.cmdGetVersion, me);
	me.channel.on('load', me.cmdLoad, me);
}

//============== API commands ==============

/** Возвращает версию словаря.*/
API.prototype.cmdGetVersion = function(userModel, data, callback) {
	callback({version: this.service.dictionary.version});
}

/** Загрузка словаря.*/
API.prototype.cmdLoad = function(userModel, data, callback) {
	callback({dictionary: this.service.dictionary});
}

// Создает только один экземпляр класса
API.getInstance = function(){
    if (!this.instance) {
    	this.instance = new API();
    }
    return this.instance;
}

module.exports = API.getInstance();