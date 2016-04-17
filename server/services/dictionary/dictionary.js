/**
 * Сервис словаря
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require('mongoose');
var _ = require('underscore');

var Service = function() {
	this.dictionary = {};
}

// перезагрузка словаря (используется поставщиком данных, например, грантом)
Service.prototype.setData = function(version, data, callback) {
	var me = this,
		dictionaryModel = mongoose.model('dictionary');

	dictionaryModel.find().remove(function(err) {
		if (!err) {
			var dictionary = new dictionaryModel({
				version: version,
				words: data,
			});
			dictionary.save(function(err) {
				if (!err) {
					callback(null);
				} else {
					callback(err);
				}
			});
		} else {
			callback(err);
		}
	});
}

// загрузка словаря в оперативку
Service.prototype.load = function(callback) {
	var me = this,
		word, tree;

	me.dictionary = {};
	me.tree = {};

	mongoose.model('dictionary').findOne().lean().exec(function(err, json) {
		if (!err) {
			// данные словаря
			me.dictionary = json;

			// строю дерево словаря
			for(var i = 0; i < me.dictionary.words.length; i++) {
				word = me.dictionary.words[i].split("");
				tree = me.tree;
				for(var j = 0; j < word.length; j++) {
					if (!tree[word[j]]) {
						tree[word[j]] = {};
					}
					tree = tree[word[j]];
				}
				tree.leaf = true;
			}

			callback();

		} else {
			callback(error.factory('dictionary', 'load', 'DB error ' + err, logger));
		}
	});

	// списки букв для дальнейшего использования``
	me.letters = {
		gl: [],
		sgl: [],
		hardGl: [],
		hardSgl: []
	};

	_.each(config.letters, function(value, key) {
		if (value.hard) {
			if (value.gl) {
				me.letters.hardGl.push(key);
			} else {
				me.letters.hardSgl.push(key);
			}
		} else {
			if (value.gl) {
				me.letters.gl.push(key);
			} else {
				me.letters.sgl.push(key);
			}
		}
	});

}

// проверка наличия слова в словаре
Service.prototype.hasWord = function(word) {
	var me = this;
	if (word) {
		return me.dictionary.words.indexOf(word.toLowerCase()) != -1;
	}
}

// выдает случайное слово соответствующей длины
Service.prototype.getRandomWord = function(wordLength) {
	var me = this,
		word;
	while(!word) {
		var randomIndex = _.random(0, me.dictionary.words.length);
		if (wordLength) {
			for(var i = randomIndex; i < me.dictionary.words.length; i++) {
				if (me.dictionary.words[i].length == wordLength) {
					word = me.dictionary.words[i];
					break;
				}
			}
		} else {
			word = me.dictionary.words[randomIndex];
		}
	}
	return word;
}

// выдает случайную букву 
Service.prototype.getRandomLetter = function() {
	var me = this,
		word = me.getRandomWord(),
		randomIndex = _.random(0, word.length-1);
	return word[randomIndex];
}

Service.prototype.generateLetter = function(letters) {
	var me = this,
		letter,
		setOfLetters = {},
		count = 0,
		glCount = 0,
		hardCount = 0,
		tryes = 0,
		randomIndex,
		group, groups;

	_.each(letters, function(item) {
		if (setOfLetters[item.letter]) {
			setOfLetters[item.letter] += 1;
		} else {
			setOfLetters[item.letter] = 1;
		}

		if (config.letters[item.letter].gl) {
			glCount++;
		}

		if (config.letters[item.letter].hard) {
			hardCount++;
		}

		count++;
	});

	// определяю возможные группы для буквы
	if (glCount / count > 0.4) {
		if (hardCount / count > 0.2) {
			group = me.letters.sgl;
		} else {
			group = _.union(me.letters.sgl, me.letters.hardSgl);
		}
	} else {
		if (hardCount / count > 0.2) {
			group = me.letters.gl;
		} else {
			group = _.union(me.letters.gl, me.letters.hardGl);
		}
	}

	randomIndex = _.random(0, group.length-1);
	do {
		letter = group[randomIndex];

		// не может быть повторов сложных букв, обычные буквы повторяются до 2х раз, не может быть повторов, если букв меньше 10
		if (((setOfLetters[letter] > 0 && (count <= 10 || config.letters[letter].hard)) || setOfLetters[letter] > 1) && tryes++ <= group.length) { 
			letter = null;
			randomIndex = randomIndex < group.length-1 ? randomIndex + 1 : 0;
		}

	} while(!letter);

	return letter;
}

// перемешивает буквы в слове
Service.prototype.mixWord = function(word) {
	var index1, index2, tmp;
	word = word.split('');
	for(var i = 0; i < 10; i++) {
		index1 = _.random(0, word.length-1);
		index2 = _.random(0, word.length-1);
		tmp = word[index2];
		word[index2] = word[index1];
		word[index1] = tmp;
	}
	return word.join('');
}

// выдает слово, составленное из набора букв, определенной длины
Service.prototype.getWordFromLetters = function(letters, wordLength) {
	var me = this,
		word,

		innerGetWord = function(word, letters, tree, deepLength) {
			var result;
			if (deepLength == 0) {
				return tree.leaf ? word : false;
			} else if (letters.length) {
				for(var i = 0; i < letters.length; i++) {
					if (tree[letters[i]]) {
						if (result = innerGetWord(word + letters[i], _.without(letters, letters[i]), tree[letters[i]], deepLength-1)) {
							return result;
						}
					}
				}
			} else {
				return false;
			}
		};

	return innerGetWord('', letters, me.tree, wordLength);
}

// выдает слово, составленное из набора букв, длина которого вероятностна
Service.prototype.getChanceWordFromLetters = function(letters) {
	var me = this,
		randomNum = _.random(0,100),
		word;
	
	if (randomNum <= 30) {
		wordLength = 3;
	} else if (randomNum <= 60) {
		wordLength = 4;
	} else if (randomNum <= 80) {
		wordLength = 5;
	} else {
		wordLength = 6;
	}

	while(!word && wordLength > 2) {
		word = me.getWordFromLetters(letters, wordLength--);
	}

	return word;
}


// Создает только один экземпляр класса
Service.getInstance = function() {
    if (!this.instance) {
    	this.instance = new Service();
    }
    return this.instance;
}

module.exports = Service.getInstance();