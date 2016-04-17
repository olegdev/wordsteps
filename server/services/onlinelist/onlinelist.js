/**
 * Список всех юзеров онлайн
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var user = require(SERVICES_PATH + '/user/user');
var _ = require('underscore');

var Service = function() {
	var me = this;

	me.list = {};

	me.interval = setInterval(function() {
		me.gc();
	}, 10*1000);

}

Service.prototype.add = function(uid, callback) {
	var me = this;

	if (!me.list[uid]) {

		/***/ logger.info("onlinelist@add Add new user ", uid);

		user.findById(uid, function(err, userModel) {
			if (!err) {
				if (userModel) {
					userModel.on('save', function() {
						me.api.pushUserUpdate(userModel);
					});
					me.list[uid] = userModel;
					callback(null);
				} else {
					callback(error.factory('onlinelist', 'add', 'User not found', logger));
				}
			} else {
				callback(err);
			}
		});
	} else {
		me.list[uid].disconnected = false;
		callback(null);
	}
}

Service.prototype.remove = function(uid, callback) {
	var me = this;
	if (me.list[uid]) {
		me.list[uid].disconnected = true;
	}
	callback(null);
}

Service.prototype.gc = function() {
	var me = this;
	Object.keys(me.list).forEach(function(key) {
		if (me.list[key].disconnected && !me.list[key].get('bindings', 'battle')) {
			delete me.list[me.list[key].id];
		}
	});

	/***/ logger.info("onlinelist@gc Online: "+ Object.keys(me.list).length);

}

// Создает только один экземпляр класса
Service.getInstance = function(){
    if (!this.instance) {
    	this.instance = new Service();
    }
    return this.instance;
}

module.exports = Service.getInstance();