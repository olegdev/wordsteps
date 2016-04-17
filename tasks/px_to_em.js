/**
 * Загрузка словаря
 */

var fs = require('fs');
var path = require('path');
var _ = require('underscore');

module.exports = function(grunt) {
	return function() {
	    var options = this.options();
		var data = fs.readFileSync(options.dataFileName, 'utf8');
		var ems = [];
		data = data.split('px');
		for(var i = 0; i < data.length; i++) {
			var num = parseInt(data[i]); 
			// ems.push((num / options.emSize).toFixed(3));
			ems.push(Math.round(num / options.emSize));
		}

		fs.writeFileSync(options.destFileName, ems.join('em '), {encoding: 'utf8'});
	}
};