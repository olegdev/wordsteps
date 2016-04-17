/**
 * Модуль авторизации
 */
var mongoose = require("mongoose");

var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');

var Service = {

	/**
	 * Вернет uid или false
	 */
	auth: function(login, pass, callback) {

		/***/ logger.info("auth request with ", login, pass);

		mongoose.model('users').findOne({'auth.login': login, 'auth.pass': pass}, function(err, user) {
			if (err) {
				callback(error.factory('auth', 'auth', 'DB error ' + err, logger));
			} else {
				if (user) {
					callback(null, user.get('_id'));
				} else {
					callback(null, false);	
				}
			}
		});
	}
};

module.exports = Service;