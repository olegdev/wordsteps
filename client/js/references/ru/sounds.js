define(function() {
var module = {exports: {}};
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

Reference.data = [{"id":1,"key":"hit_1","value":"audio/hit_1.mp3","loop":""},{"id":2,"key":"hit_2","value":"audio/hit_2.mp3","loop":""},{"id":3,"key":"click","value":"audio/click.mp3"},{"id":7,"key":"song1","value":"audio/song1.mp3","loop":1},{"id":8,"key":"hit_3","value":"audio/hit_3.mp3","loop":""},{"id":9,"key":"hit_finished","value":"audio/crash.mp3"}];
module.exports = Reference;
return module.exports; });