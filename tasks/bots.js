/**
 * Загрузка ботов
 */

require(BASE_PATH + '/server/models/user'); 

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var bots = require(SERVICES_PATH + '/bots/bots');
var dbconnect = require(SERVICES_PATH + '/dbconnect/dbconnect');

module.exports = function(grunt) {
	return function() {
	    var options = this.options();
		var done = this.async();
		bots.loadDataFromRef(function(err) {
			if (err) {
				grunt.log.error('Error:', err);
				done(false);
			} else {
				done(true);
			}
		});
	}
};