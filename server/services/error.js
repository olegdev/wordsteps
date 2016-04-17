/**
 * Сервис ошибок
 */

var Service = {
	/**
	 * Создает объект ошибки
	 */
	factory: function(service, method, msg, handler) {
		var config;
		if (typeof service == 'object') {
			config = service;
		} else {
			config = {
				service: service,
				method: method,
				msg: msg,
				handler: handler
			};
		}
		var error = new Error(config);
		if (error.handler && typeof error.handler.handleError == 'function') {
			error.handler.handleError(error);
			error.status = 'handled';
		}
		return error;
	}
};

/**
 * Класс ошибки
 */
var Error = function(config) {
	this.status = 'new';
	this.service = config.service || 'unknown';
	this.method = config.method || 'unknown';
	this.msg = config.msg || 'error without message';
	this.handler = config.handler;
}

module.exports = Service;