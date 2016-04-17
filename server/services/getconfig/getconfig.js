/**
 * Формирует конфиг для юзера при инициализации клиента
 */
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var _ = require('underscore');
var user = require(SERVICES_PATH + '/user/user');
var error = require(SERVICES_PATH + '/error');

var onlineList = require(SERVICES_PATH + '/onlinelist/onlinelist');

var Service = {
	getConfig: function(uid, callback) {
		var innerFillConfig = function(userModel) {
			userModel.getConfig(function(err, config) {
				if (!err) {
					_.extend(clientConfig, {user: config} || {});
					callback(null, clientConfig);
				} else {
					callback(error.factory('getconfig', 'getConfig', 'user model getConfig error ' + err, logger));			
				}
			});
		}
		var clientConfig = {
			debug: CONFIG.debug,
		};

		if (onlineList.list[uid]) {
			innerFillConfig(onlineList.list[uid]);
		} else {
			user.findById(uid, function(err, userModel) {
				if (!err) {
					if (userModel) {
						innerFillConfig(userModel);
					} else {
						callback(null, null);
					}
				} else {
					callback(error.factory('getconfig', 'getConfig', 'user findById error' + err, logger));
				}
			});

		}
	}
};

module.exports = Service;