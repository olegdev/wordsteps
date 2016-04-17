/**
 * Накатывает изменения модели на данные игроков
 */

require(BASE_PATH + '/server/models/user'); 

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var mongoose = require('mongoose');

var dbconnect = require(SERVICES_PATH + '/dbconnect/dbconnect');

module.exports = function(grunt) {
	return function() {
	    var options = this.options();
		var done = this.async();
		mongoose.model('users').find({}, function(err, users) {
			if (!err) {
				for(var i = 0; i < users.length; i++) {
					if (!users[i].get('buffs')) {
						users[i].set('buffs', {});
						users[i].save();
					}
				}
				done(true);
			} else {
				done(false);
			}
		});
	}
};