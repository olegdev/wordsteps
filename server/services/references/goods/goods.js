/**
 * Справочник товаров
 *
    id - идентификатор
    name - название латиницей
    title - название
    desc - описание
    image_url - урл картинки
 */
var Reference = {};
var _ = require('underscore');

/**
 * Вернет данные по названию товара
 */
Reference.getInfoByName = function(name) {
	for(var i = 0; i < this.data.length; i++) {
		if (this.data[i].name == name) {
			return this.data[i];
		}
	}
}

// послдение строчки обрабатываются grunt'ом, не менять!

Reference.data = JSON.parse(require('fs').readFileSync(__filename + 'on', 'utf8'));
module.exports = Reference;