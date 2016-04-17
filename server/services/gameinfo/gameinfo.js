/*** Аналитика */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var _ = require('underscore');

var battleService = require(SERVICES_PATH + '/battle/battle');
var onlineListService = require(SERVICES_PATH + '/onlinelist/onlinelist');

module.exports = {
	getInfo: function() {
		return {
			battles: Object.keys(battleService.battles).length,
			online: Object.keys(onlineListService.list).length,
		}
	}
}