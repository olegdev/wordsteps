/**
 * API рейтинга
 */
var _ = require('underscore');

var socketsService = require(SERVICES_PATH + '/sockets');
var onlineListService = require(SERVICES_PATH + '/onlinelist/onlinelist');

var API = function() {
	var me = this;

	me.service = require(SERVICES_PATH + '/rating/rating');
	me.service.api = me;

	me.channel = socketsService.createChannel('rating');
	me.channel.on('get_rating', me.cmdGetRating, me);
}

//============== API commands ==============

API.prototype.cmdGetRating = function(userModel, params, callback) {
	var me = this,
		result = [];

	_.each(me.service.rating, function(list, league) {
		_.each(list, function(u, i) {
			result.push({
				id: u.id,
				info: u.get('info'),
				rating: u.get('rating'),
				place: i,
				online: onlineListService.list[u.id] ? true : false,
			});
		});
	});

	callback(result);
}

// Создает только один экземпляр класса
API.getInstance = function(){
    if (!this.instance) {
    	this.instance = new API();
    }
    return this.instance;
}

module.exports = API.getInstance();