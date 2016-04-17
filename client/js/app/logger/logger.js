define([

], function() {

	var logConfig = {
		enabled: {
			info: false,
			warn: true,
			error: true,
		}
	};

	var Logger = function(prefix) {
		this.prefix = prefix;
	}

	Logger.prototype.info = function() {
		this.printMessage('info', Array.prototype.slice.call(arguments));
	}

	Logger.prototype.warn = function() {
		this.printMessage('warn', Array.prototype.slice.call(arguments));	
	}

	Logger.prototype.error = function() {
		this.printMessage('error', Array.prototype.slice.call(arguments));
	}	

	Logger.prototype.printMessage = function(level, msgArguments) {

		// проверяю, разрешен ли лог с таким уровнем
		if (logConfig.enabled[level]) {
			// добавляю префикс			
			msgArguments.unshift(this.prefix);

			// печатаю, если доступна консоль
			if (typeof window.console == 'object') {
				if (typeof window.console[level] == 'function') {
					console[level].apply(console, msgArguments);
				} else if (typeof console.log == 'function') {
					console.log.apply(console, msgArguments);
				}
			}
		}
	}

	Logger.enableInfoLog = function() {
		logConfig.enabled.info = true;
	}

	return Logger;
});
