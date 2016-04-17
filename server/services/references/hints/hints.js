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

Reference.data = JSON.parse(require('fs').readFileSync(__filename + 'on', 'utf8'));
module.exports = Reference;