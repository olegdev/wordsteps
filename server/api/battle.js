/**
 * API боя
 */
var socketsService = require(SERVICES_PATH + '/sockets');
var _ = require('underscore');
var messages = require(SERVICES_PATH + '/references/messages/messages');

var API = function() {
	var me = this;

	me.service = require(SERVICES_PATH + '/battle/battle');
	me.service.api = me;

	me.channel = socketsService.createChannel('battle');
	me.channel.on('get_battle', me.cmdGetBattle, me);
	me.channel.on('word', me.cmdWord, me);

	me.errorChannel = socketsService.createChannel('error');
}

//============== API commands ==============

API.prototype.cmdGetBattle = function(userModel, data, callback) {
	var me = this,
		battle = me.service.getBattleById(userModel.get('bindings', 'battle'));
	if (battle) {
		callback({battle: battle.asJson()});
	} else {
		me.errorChannel.push(userModel.id, 'error', {msg: messages.getByKey('msg_battle_not_found')});
	}
}

API.prototype.cmdWord = function(userModel, data) {
	var me = this,
		err;
	if (!data.word || !_.isArray(data.word)) {
		err = messages.getByKey('msg_invalid_params');
	} else {
		data.word.forEach(function(item) {
			if (!_.isObject(item) || typeof item.id != 'string') {
				err = messages.getByKey('msg_invalid_params');
			}
		});
	}
	if (err) {
		me.errorChannel.push(userModel.id, 'error', {msg: err});
	} else {
		this.service.onWord(userModel, data, function(err) {
			if (err) {
				me.errorChannel.push(userModel.id, 'error', {msg: err});
			}
		});
	}
}

API.prototype.pushStart = function(userModel, data) {
	this.channel.push(userModel.id, 'start', data);
}

API.prototype.pushHit = function(userModel, data) {
	this.channel.push(userModel.id, 'hit', data);
}

API.prototype.pushFinish = function(userModel, data) {
	this.channel.push(userModel.id, 'finish', data);
}

// Создает только один экземпляр класса
API.getInstance = function(){
    if (!this.instance) {
    	this.instance = new API();
    }
    return this.instance;
}

module.exports = API.getInstance();