/**
 * API поиска боя
 */
var socketsService = require(SERVICES_PATH + '/sockets');

var API = function() {
	var me = this;

	me.service = require(SERVICES_PATH + '/battle_search/battle_search');
	me.service.api = this;

	me.channel = socketsService.createChannel('battle_search');
	me.channel.on('search', me.cmdSearch, me);
	me.channel.on('cancel', me.cmdCancel, me);
}

//============== API commands ==============

API.prototype.cmdSearch = function(userModel, params) {
	var me = this;
	me.service.search(userModel);
}

API.prototype.cmdCancel = function(userModel, params) {
	var me = this;
	me.service.cancel(userModel);
}

API.prototype.pushEnemy = function(userModel, enemyModel) {
	this.channel.push(userModel.id, 'enemy', enemyModel.asJson('info;counters;'));
}

// Создает только один экземпляр класса
API.getInstance = function(){
    if (!this.instance) {
    	this.instance = new API();
    }
    return this.instance;
}

module.exports = API.getInstance();