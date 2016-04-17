/**
* Сервис соединений с сервером
* @singleton
*/
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var onlineList = require(SERVICES_PATH + '/onlinelist/onlinelist');
var messages = require(SERVICES_PATH + '/references/messages/messages');

var Service = function() {
	this.clients = {};
	this.channels = {};
	this.errorChannel = this.createChannel('error');
}

Service.prototype.listen = function(server) {
	var me = this,
		sio = require("socket.io").listen(server);
	
	sio.sockets.on("connection", function(client) {
		me._onConnect(client);
	});

	return sio;
}

Service.prototype.createChannel = function(name) {
	var me = this;
	if (!me.channels[name]) {
		me.channels[name] = {
			listeners: {},
			on: function(message, listener, scope) {
				if (!me.channels[name].listeners[message]) {
					me.channels[name].listeners[message] = [];
				}
				me.channels[name].listeners[message].push({fn: listener, scope: scope || this});
			},
			push: function(uid, message, data) {
				if (me.clients[uid]) {
					me.clients[uid].emit('push', {channel: name, message: message, data: data});
				}
			}
		}
	}
	return me.channels[name];
}

Service.prototype.getChannel = function(name) {	
	return this.channels[name];
}

Service.prototype._onConnect = function(client) {
	var me = this;
	if (client.request.session) {

		/***/ logger.info('sockets: client connected', client.request.session.uid);
		if (me.clients[client.request.session.uid]) {

			/***/ logger.info('sockets: disconnect previous connection', client.request.session.uid);
			me.clients[client.request.session.uid].disconnect();			
			setTimeout(function() {
				me._onConnect(client);
			},0);
			return;
		}

		me.clients[client.request.session.uid] = client;

		client.on('push', function(data, callback) {
			me._onPush(client, data, callback);
		});

		client.on('disconnect', function() {
			me._onDisconnect(client);
		});

		onlineList.add(client.request.session.uid, function(err) {
			if (!err) {
				client.emit('push', {channel: 'onlinelist', message: 'ready'});
			} else {
				client.disconnect();		
			}
		});

	} else {
		client.emit('push', {channel: 'error', message: 'error', data: {msg: 'Not authorized request'}});
		client.disconnect();
	}
}

Service.prototype._onPush = function(client, data, callback) {
	var me = this;

	callback = callback || function() {};

	/***/ logger.info('sockets: Connection push', data);
	if (me.channels[data.channel]) {
		if (me.channels[data.channel].listeners[data.message]) {
			me.channels[data.channel].listeners[data.message].forEach(function(listener) {
				try {
					listener.fn.call(listener.scope, onlineList.list[client.request.session.uid], data.data, callback);
				} catch(e) {
					if (CONFIG.debug) {
						throw(e);
					} else {
						me.errorChannel.push(client.request.session.uid, "error", {msg: messages.getByKey('msg_internal_error')});
					}
				}
			});
		} else {
			/***/ logger.warn('sockets: Channel listener for message "' + data.message + '" not found');	
			me.errorChannel.push(client.request.session.uid, "error", {msg: 'Unknown command "'+ data.message +'" for channel "'+ data.channel +'"'});
		}
	} else {
		/***/ logger.warn('sockets: Channel "' + data.channel + '" not found');
		me.errorChannel.push(client.request.session.uid, "error", {msg: 'Channel "'+ data.channel +'" not found'});
	}
}

Service.prototype._onDisconnect = function(client) {
	var me = this;
	
	/***/ logger.info('sockets: Client disconnected ', client.request.session.uid);
	me.clients[client.request.session.uid] = undefined;	

	onlineList.remove(client.request.session.uid, function() {});
}

// Создает только один экземпляр класса
Service.getInstance = function(){
    if (!this.instance) {
    	this.instance = new Service();
    }
    return this.instance;
}

module.exports = Service.getInstance();