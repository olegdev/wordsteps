/**
 * Справочник лиг
 *
    id - идентификатор
    index - индекс
    name - название
    points - кол-во очков для вхождения в лигу
 */
var Reference = {};
var _ = require('underscore');

/**
 * Название лиги по индексу
 */
Reference.getNameByIndex = function(index) {
	for(var i = 0; i < this.data.length; i++) {
		if (this.data[i].index == index) {
			return this.data[i].name;
		}
	}
}

/**
 * Информация о лиге по индексу
 */
Reference.getLeagueByIndex = function(index) {
	for(var i = 0; i < this.data.length; i++) {
		if (this.data[i].index == index) {
			return this.data[i];
		}
	}
}

/**
 * Данные следующей лиги, если есть
 */
Reference.getNextLeague = function(index) {
	return this.data[index];
}


// послдение строчки обрабатываются grunt'ом, не менять!

Reference.data = JSON.parse(require('fs').readFileSync(__filename + 'on', 'utf8'));
module.exports = Reference;