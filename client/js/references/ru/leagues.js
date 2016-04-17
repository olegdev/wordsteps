define(function() {
var module = {exports: {}};
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

Reference.data = [{"id":1,"index":1,"name":"Белый пояс","delta":1000,"fight_count":3,"points":1000},{"id":2,"index":2,"name":"Жёлтый пояс","delta":1000,"fight_count":7,"points":2000},{"id":3,"index":3,"name":"Оранжевый пояс","delta":1000,"fight_count":15,"points":3000},{"id":4,"index":4,"name":"Зелёный пояс","delta":1000,"fight_count":25,"points":4000},{"id":5,"index":5,"name":"Синий пояс","delta":1000,"fight_count":45,"points":5000},{"id":6,"index":6,"name":"Коричневый пояс","delta":1000,"fight_count":75,"points":6000},{"id":7,"index":7,"name":"Черный пояс","delta":1000,"fight_count":120,"points":7000}];
module.exports = Reference;
return module.exports; });