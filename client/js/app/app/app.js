define([		
	'logger/logger',
	'sockets/sockets',
	'app/models/user',
	'battle/battle',
	'location/location',
	'dictionary/dictionary',
	'social/social',
	'sound/sound',
], function(Logger, sockets, UserModel, battle, location, dictionary, social, sound) {

	var logger = new Logger("app");

	return {
		initialize: function(config) {
			APP = {
				config: config,
				user: new UserModel(config.user),
			};

			if (APP.config.debug) {
				Logger.enableInfoLog();
			}

			sockets.connect();

			if (social.isSocialUser()) {
				social.init();
			}
			
			var onlineListChannel = sockets.createChannel('onlinelist');
			onlineListChannel.on('ready', function(data) {
				if (APP.user.get('bindings').battle) {
					dictionary.checkUpdate(function() {
						battle.loadAndShow();
					});
				} else {
					location.render(APP.user);
				}
				onlineListChannel.push('get_online', {}, function(data) {
					logger.info('online list', data);
				});
			}, {single: true});

			onlineListChannel.on('user_update', function(data) {
				APP.user.set(data);	
			});

			var errorChannel = sockets.createChannel('error');
			errorChannel.on('error', function(data) {
				if (APP.config.debug) {
					alert(data.msg);
				} else {
					if (console && console.error) {
						console.error(data.msg);
					}
				}
			});

			return APP;
		},
	};
});
