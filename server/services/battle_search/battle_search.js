/**
 * Поиск противника
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var _ = require('underscore');

var botsService = require(SERVICES_PATH + '/bots/bots');
var battleService = require(SERVICES_PATH + '/battle/battle');

var Service = function() {
	var me = this;
	this.queue = [];
	this.interval = setInterval(function() {
		me.checkQueue();
	}, 1000);
}

Service.prototype.checkQueue = function() {
	var me = this;
	if (me.queue.length > 1) {
		for(var i = 0; i < me.queue.length; i+=2) {
			if (me.queue[i] && me.queue[i+1]) {
				me.goBattle(me.queue[i], me.queue[i+1]);
			}
		}
		if (i > 0) {
			me.queue = me.queue.slice(i, me.queue.length);
		}
	}
}

Service.prototype.goBattle = function(u1,u2) {
	var me = this;
	me.api.pushEnemy(u1, u2);
	me.api.pushEnemy(u2, u1);
	battleService.createBattle(u1, u2);
}

Service.prototype.search = function(userModel) {
	var me = this,
		alreadyQueued = false;
	for(var i = 0; i < this.queue.length; i++) {
		if (this.queue[i].id == userModel.id) {
			alreadyQueued = true;
			break;
		}
	}
	if (!alreadyQueued) {
		this.queue.push(userModel);
		// if (this.queue.length == 1) {
		// 	me.startBotIjectMonitor();
		// } else {
		// 	me.stopBotInjectMonitor();
		// }
	}
}

Service.prototype.startBotIjectMonitor = function() {
	var me = this,
		u1;
	me.botInjectTimeout = setTimeout(function() {
		if (me.queue.length == 1) {
			u1 = me.queue.shift();
			u2 = botsService.findBotForUser(u1);
			if (u2) {
				me.goBattle(u1, u2);
			} else {
				// не подобрался .. возможно все в бою, стартую новый монитор
				me.startBotIjectMonitor();
			}
		}
	}, _.random(7, 12) * 1000);
}

Service.prototype.stopBotInjectMonitor = function() {
	var me = this;
	clearTimeout(me.botInjectTimeout);
}

Service.prototype.cancel = function(userModel) {
	for(var i = 0; i < this.queue.length; i++) {
		if (this.queue[i].id == userModel.id) {
			this.queue.splice(i, 1);
			break;
		}
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