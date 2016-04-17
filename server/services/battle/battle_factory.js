/**
 * Фабрика по созданию боя
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var _ = require('underscore');

var dictionary = require(SERVICES_PATH + '/dictionary/dictionary');

var Service = function() {
	var me = this;
}

var initLetters = function(battle) {
	var innerInitLetters = function() {
		var seed = dictionary.getRandomWord(config.columns*2);
		return dictionary.mixWord(seed).split("");
	}

	var letters = {},
		inititalLetters = innerInitLetters(),
		id;

	for(var i = 0; i < 2; i++) {
		for(var j = 0; j < config.columns; j++) {
			id = battle.genLocalId('ltr');
			letters[id] = {
				id: id,
				row: i,
				column: j,
				letter: inititalLetters[i*config.rows + j],
			};
		}
	}

	return letters;
}

Service.prototype.factory = function(userModel, userModel2) {
	var me = this,
		battle = {
			id: _.uniqueId('btl_'),
			sides: [{
				u: userModel,
			}, {
				u: userModel2,
			}],
			fieldSize: {
				rows: config.rows,
				columns: config.columns,
			},
			hitIndex: 0,
			asJson: function() {
				return {
					id: this.id,
					fieldSize: this.fieldSize,
					sides: [{
						u: this.sides[0].u.asJson('info;counters;'),
						letters: this.sides[0].letters,
						isWin: this.sides[0].isWin,
					},{
						u: this.sides[1].u.asJson('info;counters;'),
						letters: this.sides[1].letters,
						isWin: this.sides[1].isWin,
					}]
				}
			},
			genLocalId: function(prefix) {
				if (!me[prefix + '_counter']) {
					me[prefix + '_counter'] = 0;
				}
				return prefix + (me[prefix + '_counter']++);
			}
		};

	battle.sides[0].letters = initLetters(battle);
	battle.sides[1].letters = initLetters(battle);

	return battle;
}

// Создает только один экземпляр класса
Service.getInstance = function(){
    if (!this.instance) {
    	this.instance = new Service();
    }
    return this.instance;
}

module.exports = Service.getInstance();