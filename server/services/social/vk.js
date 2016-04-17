/**
 * Сервис ВКонтакте
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require('mongoose');
var _ = require('underscore');
var md5 = require('md5');
var VKSDK = require('vksdk');

var userService = require(SERVICES_PATH + '/user/user');

var Service = function() {
	this.vkApi = new VKSDK({
	   'appId'     : config.app_id,
	   'appSecret' : config.app_secret,
	   'language'  : 'ru'
	});
}

/*** Авторизация ВК */
Service.prototype.auth = function(request, callback) {
	var me = this,
		user;

	/****/ logger.info("check signature");
	if (me.checkAuthKey(request)) {
		/****/ logger.info("find one by vkID");
		mongoose.model('users').findOne({'auth.vkId': request.viewer_id}, function(err, user) {
			if (err) {
				callback(error.factory('vk', 'auth', 'DB error ' + err, logger));
			} else {
				if (user) {
					/****/ logger.info("user found");
					callback(null, user.get('_id'));
				} else {
					/****/ logger.info("vk api request");
					/****/ logger.info("vk api viewer_id", request.viewer_id);
					/****/ logger.info("vk api user_id", request.user_id);

					me.vkApi.request('users.get', {user_id: request.viewer_id, fields: ['photo_50'], lang: 'ru'}, function(resp) {

						/****/ logger.info("vk api resp");

						if (resp && resp.response && resp.response.length) {

							/****/ logger.info("register new one");

							userService.register({
						   		auth: {
						   			vkId: request.viewer_id
						   		},
						   		info: {
						   			title: resp.response[0].first_name + ' ' + resp.response[0].last_name,
						   			img: resp.response[0].photo_50,
						   		}
						   	}, function(err, userModel) {
								if (!err) {
									/****/ logger.info("success");
									callback(null, userModel.model.id);
								} else {
									/****/ logger.info("reg error");
									callback(error.factory('vk', 'auth', 'User register error ' + err, logger));
								}
							});
						} else {
							callback(error.factory('vk', 'auth', 'Data from vk api is invalid ' + JSON.stringify(resp), logger));					
						}
					});
				}
			}
		});
	} else {
		callback(error.factory('vk', 'auth', 'Request auth key is invalid', logger));
	}
}

/*** Стол заказов ВК */
Service.prototype.order = function(data, callback) {
	var me = this,
		goodsRef = require(SERVICES_PATH + '/references/goods/goods'),
		goods;

	if (me.checkSig(data)) {
		if (data.notification_type == 'get_item' || data.notification_type == 'get_item_test') {
			goods = goodsRef.getInfoByName(data.item);
			if (goods) {
				callback(null, {
					title: goods.title,
					photo_url: goods.image_url,
					price: goods.price,
					expiration: 900000,
				});
			} else {
				callback(null, {
					error: {
						error_code: 20,
						error_msg: "Item not found"
					}
				});
			}
		} else if (data.notification_type == 'order_status_change' || data.notification_type == 'order_status_change_test') {
			if (data.status == 'chargeable') {
				userService.findOne({'auth.vkId': data.user_id}, function(err, userModel) {
					if (!err) {
						if (userModel) {
							userModel.set('buffs', 'free_energy', {expired: false});
							userModel.save(function(err) {
								if (!err) {
									callback(null, {order_id: data.order_id});	
								} else {
									callback(error.factory('vk', 'order', 'Cannot finish order - DB error ' + err, logger));				
								}
							});
						} else {
							callback(error.factory('vk', 'order', 'Cannot finish order - user not found', logger));				
						}
					} else {
						callback(error.factory('vk', 'order', 'Cannot find user - DB error ' + err, logger));				
					}
				});
			} else {
				callback(error.factory('vk', 'order', 'Unknown order status', logger));				
			}
		}
	} else {
		callback(error.factory('vk', 'order', 'Request signature is invalid', logger));
	}
}

Service.prototype.checkAuthKey = function(request) {
	var str = request.api_id + '_' + request.viewer_id + '_' + config.app_secret;
	return request.auth_key === md5(str);
}

Service.prototype.checkSig = function(data) {
	var keys = Object.keys(data),
		str = "";
	keys.sort(function(v1,v2) {
		if (v1 > v2) {
			return 1;
		} else {
			return -1;
		}
	});
	for(var i = 0; i < keys.length; i++) {
		if (keys[i] != 'sig') {
			str += keys[i] + '=' + data[keys[i]];
		}
	}
	str += config.app_secret;
	return data.sig === md5(str);
}

// Создает только один экземпляр класса
Service.getInstance = function() {
    if (!this.instance) {
    	this.instance = new Service();
    }
    return this.instance;
}

module.exports = Service.getInstance();