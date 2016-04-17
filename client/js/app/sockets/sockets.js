/**
 * Управляет клиентским соединением с сервером
 */
define([
	'socket.io',
	'logger/logger',
], function(sio, Logger) {	

	var socket;
	var logger = new Logger("sockets");	

	var channels = {};

	return {
		connect: function() {

			socket = sio(location.protocol + "//" +location.host);

			socket.on('connect', function() {
				/***/ logger.info('Connection established');
			});
			socket.on('disconnect', function() {
				/***/ logger.info('Disconnected');
			});
			socket.on('push', function(data) {
				/***/ logger.info('Connection push', data);
				if (channels[data.channel]) {
					if (channels[data.channel].listeners[data.message]) {
						channels[data.channel].listeners[data.message].fn(data.data);
						if (channels[data.channel].listeners[data.message].opts.single) {
							channels[data.channel].listeners[data.message] = undefined;
						}
					} else {
						/***/ logger.warn('Channel listener for message "' + data.message + '" not found');	
					}
				} else {
					/***/ logger.warn('Channel "' + data.channel + '" not found');
				}
			});
		},
		
		createChannel: function(name) {

			channels[name] = {
				listeners: {}
			};

			return {
				on: function(message, listener, opts) {
					channels[name].listeners[message] = {fn: listener, opts: opts || {}};
				},
				push: function(message, data, callback, opts) {
					opts = opts || {};

					if (callback) {
						callbackFn = function(data) {
							if (data && data.user) {
								APP.user.set(data.user);
							}
							callback(data);
						}
					} else {
						callbackFn = function() {}
					}

					if (opts.delay) {
						setTimeout(function() {
							socket.emit('push', {channel: name, message: message, data: data}, callbackFn);
						}, opts.delay);
					} else {
						socket.emit('push', {channel: name, message: message, data: data}, callbackFn);
					}
				}
			}
		}

	};
});