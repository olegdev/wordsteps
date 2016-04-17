/**
 * Работа с юзером
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require("mongoose");

var userModelService = require(SERVICES_PATH + '/user/usermodel');

var Service = function() {
	this.safeQueue = {};
}

/**
 * Регистрация
 * @param data {Object} Авторизационные данные и личные данные (имя, картинка)
 */
Service.prototype.register = function(data, callback) {
	var me = this,
		user;

	user = userModelService.factory();
	user.set('auth', null, data.auth);
	user.set('info', null, data.info);

	user.model.save(function(err) {
		if (!err) {
			callback(null, user);
		} else {
			callback(error.factory('user', 'register', 'DB error ' + err, logger));
		}
	});
}

/**
 * Поиск по id модели
 * @return UserModel 
 */
Service.prototype.findById = function(uid, callback) {
	mongoose.model('users').findById(uid, function(err, user) {
		if (err) {
			callback(error.factory('user', 'findById', 'DB error ' + err, logger));
		} else {
			if (user) {
				callback(null, userModelService.factory(user));
			} else {
				callback(null, false);
			}
		}
	});
}

/**
 * Поиск нескольких моделей удовлетворяющих некоторому критерию
 * @param criteria {Object} Критерий поиска
 * @return UserModel[]
 */
Service.prototype.find = function(criteria, callback) {
	var userModels = [],
		onlineList = require(SERVICES_PATH + '/onlinelist/onlinelist');
	mongoose.model('users').find(criteria, function(err, users) {
		if (err) {
			callback(error.factory('user', 'find', 'DB error ' + err, logger));
		} else {
			for(var i = 0; i < users.length; i++) {
				if (onlineList.list[users[i].id]) {
					userModels.push(onlineList.list[users[i].id]);
				} else {
					userModels.push(userModelService.factory(users[i]));
				}
			}
			callback(null, userModels);
		}
	});
}

/**
 * Поиск модели удовлетворяющей некоторому критерию
 * @param criteria {Object} Критерий поиска
 * @return UserModel[]
 */
Service.prototype.findOne = function(criteria, callback) {
	var onlineList = require(SERVICES_PATH + '/onlinelist/onlinelist');
	mongoose.model('users').findOne(criteria, function(err, user) {
		if (err) {
			callback(error.factory('user', 'find', 'DB error ' + err, logger));
		} else {
			if (onlineList.list[user.id]) {
				callback(null, onlineList.list[user.id]);
			} else {
				callback(null, userModelService.factory(user));
			}
		}
	});
}

/**** @deprecated ***/
Service.prototype.safe = function(userModel, fn) {
	var me = this,
		queue = me.safeQueue[userModel.id],

		execQueue = function(queue, callback) {
			var me = this;

				next = function() {
					var fn = queue[0];
					fn(function() {
						queue.shift();
						if (queue.length) {
							next();
						} else {
							callback();
						}
					});
				};

			if (queue && queue.length) {
				next();
			}
		};

	if (!queue) {
		queue = me.safeQueue[userModel.id] = [fn];
	} else {
		me.safeQueue[userModel.id].push(fn);
	}
	if (me.safeQueue[userModel.id].length == 1) {
		execQueue(queue, function() {
			me.safeQueue[userModel.id] = undefined;
		});
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