/**
 * Справочник клиентских сообщений
 *
    id - идентификатор
    key - ключ 
    value - значение
 */
var Reference = {};

/**
 * Вернет путь до файла по ключу
 */
Reference.getByKey = function(key) {
	for(var i = 0; i < this.data.length; i++) {
		if (this.data[i].key == key) {
			return this.data[i].value;
		}
	}
}

// послдение строчки обрабатываются grunt'ом, не менять!

Reference.data = JSON.parse(require('fs').readFileSync(__filename + 'on', 'utf8'));
module.exports = Reference;