/**
 * Сервис ботов
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require('mongoose');
var _ = require('underscore');

var battleService = require(SERVICES_PATH + '/battle/battle');
var dictionaryService = require(SERVICES_PATH + '/dictionary/dictionary');
var userModelService = require(SERVICES_PATH + '/user/usermodel');
var botsRef = require(SERVICES_PATH + '/references/bots/bots');

var Service = function() {
	this.bots = [];
	this.battleBots = [];
	this.startBattleBotsMonitor();
}

// загрузка ботов в базу из справочника
Service.prototype.loadDataFromRef = function(callback) {
	var me = this,
		model = mongoose.model('users'),
		bot, bots = [];

	// подготавливаю данные
	for(var i = 0 ; i < botsRef.data.length; i++) {
		bot = botsRef.data[i];
		bots.push({
			botId: bot.id,
			info: {
				title: bot.name,
				img: bot.img
			},
			rating: {
				league: bot.league,
				points: bot.points
			},
			counters: {
				wins: 0,
				loses: 0,
			},
			buffs: {
				free_energy: {},
			}
		});
	}

	// удаляю прежние записи
	model.find( {botId: {$ne: null}}).remove(function(err) {
		if (!err) {
			// вставляю новые
			model.collection.insert(bots, function(err) {
				callback(err);
			});
		} else {
			callback(err);
		}
	});
}

// загрузка ботов в оперативку
Service.prototype.load = function(callback) {
	var me = this,
		model = mongoose.model('users'),
		bot, bots = [];

	model.find( {botId: {$ne: null}}, function(err, bots) {
		if (!err) {
			for(var i = 0; i < bots.length; i++) {
				me.bots.push(userModelService.factory(bots[i]));
			}
			callback(null);
		} else {
			callback(err);
		}
	});
}

// подобрать бота для юзера
Service.prototype.findBotForUser = function(u) {
	var me = this,
		randomIndex,
		bot;
	if (me.bots.length) {
		randomIndex = _.random(0, me.bots.length-1);
		bot = me.bots[randomIndex];
		me.bots = _.without(me.bots, bot);
		setTimeout(function() {
			me.battleBots.push(bot);
		}, 1000);
		return bot;
	}
}

// стартует монитор ботов в бою
Service.prototype.startBattleBotsMonitor = function() {
	var me = this;

	me.battleBotsMonitor = setInterval(function() {
		var finished = [], bot;
		if (me.battleBots.length) {
			for(var i = 0; i < me.battleBots.length; i++) {
				bot = me.battleBots[i];
				if (bot.get('bindings', 'battle')) {
					if (_.random(0,100) >= 70) { // 30% что нанесет удар
						me.makeHit(bot);
					}
				} else {
					finished.push(bot);
				}
			}
			if (finished.length) {
				me.battleBots = _.difference(me.battleBots, finished);
				me.bots = me.bots.concat(finished);
			}
		}

	}, 5000);
}

// наносит удар
Service.prototype.makeHit = function(bot) {
	var me = this,
		battle = battleService.battles[bot.get('bindings', 'battle')],
		sideIndex,
		letters = [],
		lettersIds = [],
		randomNum = _.random(0,100),
		wordLength, word ,wordData = [];

	if (battle) {
		if (battle.sides[0].u.id == bot.id) {
			sideIndex = 0;
		} else {
			sideIndex = 1;
		}

		_.each(battle.sides[sideIndex].letters, function(value, key) {
			letters.push(value.letter);
			lettersIds.push(key);
		});

		if (randomNum < 60) {
			wordLength = 3;
		} else if (randomNum < 80) {
			wordLength = 4;
		} else if (randomNum < 95) {
			wordLength = 5;
		} else {
			wordLength = 5;
		}

		do {
			word = dictionaryService.getWordFromLetters(letters, wordLength);
		} while(!word && --wordLength >= 3);

		if (word) {
			word = word.split('');
			for(var i = 0; i < word.length; i++) {
				for(var j = 0; j < letters.length; j++) {
					if (word[i] == letters[j]) {
						wordData.push(battle.sides[sideIndex].letters[lettersIds[j]]);
						letters[j] = '---';
						break;
					}
				}
			}
			battleService.onWord(bot, {word: wordData}, function() {});
		}

	} else {
		/***/ error.factory('bots', 'makeHit', 'Battle not found', logger)
	}
}


// Создает только один экземпляр класса
Service.getInstance = function() {
    if (!this.instance) {
    	this.instance = new Service();
    }
    return this.instance;
}

module.exports = Service.getInstance();