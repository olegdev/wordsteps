define(function() {
var module = {exports: {}};
/**
 * Справочник подсказок
 *
    id - идентификатор
    group - группа 
    value - значение
 */
var Reference = {};
var _ = require('underscore');

/**
 * Случайную подсказку из группы
 */
Reference.getRandomFromGroup = function(groupId) {
	var hints = [];
	for(var i = 0; i < this.data.length; i++) {
		if (this.data[i].group == groupId) {
			hints.push(this.data[i].value);
		}
	}
	return hints[_.random(0, hints.length-1)];
}

// послдение строчки обрабатываются grunt'ом, не менять!

Reference.data = [{"id":8,"value":"Чем больше букв, тем круче удар!","group":1}];
module.exports = Reference;
return module.exports; });