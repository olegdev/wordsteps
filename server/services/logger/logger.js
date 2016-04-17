/**
 * Создает логгер для модуля
 */
var winston = require('winston');
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var path = require('path');

var createLogger = function(modulePath) {
	var transports = [],
		logger;	

	if (config['console']) {
		transports.push(new (winston.transports.Console)());
	}

	if (config['file']) {
		transports.push(new (winston.transports.File)({ filename: BASE_PATH + '/log/'+ path.basename(modulePath, '.js') +'.log' }));
	}

	logger = new (winston.Logger)({
		transports: transports
	});

	// реализуем интерфейс обработчика ошибок
	logger.handleError = function(error) {
		this.error(error.service + '@' + error.method + ': ' + error.msg);
	}

	return logger;
}

module.exports = createLogger;