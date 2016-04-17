/**
 * API юзера
 */
var socketsService = require(SERVICES_PATH + '/sockets');

var API = function() {
	var me = this;

	me.channel = socketsService.createChannel('user');
	me.channel.on('get_user', me.cmdGetUser, me);
}

//============== API commands ==============

API.prototype.cmdGetUser = function(userModel, params, callback) {
	var me = this;
	callback(userModel.asJson('info;counters;bindings;timed'));
}

// Создает только один экземпляр класса
API.getInstance = function(){
    if (!this.instance) {
    	this.instance = new API();
    }
    return this.instance;
}

module.exports = API.getInstance();