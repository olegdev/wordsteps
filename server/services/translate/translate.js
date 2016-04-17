/**
 * Словарь
 */
var fs = require('fs');
var _ = require('underscore');
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);

var Dictionary = function() {
	var me = this;

	/**
	 * Дефолтный язык
	 */
	me.defaultLang = config.defaultLang;

	/**
	 * Список поддерживаемых языков
	 */
	me.langs = config.langs;

	// /**
	//  * Все переводы
	//  */
	// me.words = {};

	// for(var i = 0; i < config.langs.length; i++) {
	// 	me.words[config.langs[i]] = {};
	// 	if (fs.existsSync(__dirname + '/' + config.langs[i])) {
	// 		var files = fs.readdirSync(__dirname + '/' + config.langs[i]);
	// 		files.forEach(function(filename) {
	// 			me.words[config.langs[i]] = _.extend(me.words[config.langs[i]], JSON.parse(fs.readFileSync(__dirname + '/' + config.langs[i] + '/' + filename, 'utf8')));
	// 		});
	// 	}
	// }
};

/**
 * Вернет значения ключа (перевод)
 */
// Dictionary.prototype.get = function(lang, key) {
//     return this.words[lang][key] || key;
// };

// Создает только один экземпляр класса
Dictionary.getInstance = function(){
    if (!this.instance) {
    	this.instance = new Dictionary();
    }
    return this.instance;
}

module.exports = Dictionary.getInstance();