/**
 * Рейтинг
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require('mongoose');
var _ = require('underscore');

var leagueRef = require(SERVICES_PATH + '/references/leagues/leagues');

var Service = function() {
	var me = this;

	me.rating = [];

	me.interval = setInterval(function() {
		me.recalcRating();
	}, 1*60*1000);

}

Service.prototype.finishBattle = function(battle, callback) {
	var me = this,
		result = {
			battle: battle.asJson()
		},
		winUser, loseUser,
		pointsWin, pointsLose;

	// прибиваю ссылки на бой
	battle.sides[0].u.set('bindings', 'battle', null);
	battle.sides[1].u.set('bindings', 'battle', null);

	if (battle.sides[0].isWin) {
		winUser = battle.sides[0].u;
		loseUser = battle.sides[1].u;
	} else {
		winUser = battle.sides[1].u;
		loseUser = battle.sides[0].u;
	}

	// обновляю счетчики
	winUser.addons.counters.incValue('wins');
	loseUser.addons.counters.incValue('loses');

	// обновляю энергию
	if (!winUser.get('buffs', 'free_energy')) {
		winUser.addons.timed.decValue('energy');	
	}
	if (!loseUser.get('buffs', 'free_energy')) {
		loseUser.addons.timed.decValue('energy');
	}

	// рейтинг
	pointsWin = me.calcPoints(winUser, loseUser);
	pointsLose = me.calcPoints(loseUser, winUser);
	winUser.addons.rating.addPoints(pointsWin);
	loseUser.addons.rating.addPoints(-pointsLose);

	result.pointsWin = pointsWin;
	result.pointsLose = pointsLose;

	// лига
	if (me.maybeNewLeague(winUser)) {
		result.league = winUser.get('rating', 'league');
	}

	// сохраняю изменения
	winUser.model.save(function(err) {
		if (!err) {
			loseUser.model.save(function(err) {
				if (!err) {
					callback(null, result);
				} else {
					callback(error.factory('rating', 'finishBattle', err, logger));
				}
			});
		} else {
			callback(error.factory('rating', 'finishBattle', err, logger));
		}
	});

}

Service.prototype.calcPoints = function(u1, u2) {
	var me = this,
		leagueIndex = u1.get('rating', 'league'),
		leagueInfo = leagueRef.getLeagueByIndex(leagueIndex),
		u1Points = u1.get('rating', 'points'),
		u2Points = u2.get('rating', 'points');
	return parseInt(leagueInfo.delta / leagueInfo.fight_count + ((u2Points - u1Points) / leagueInfo.fight_count)*0.1);
}

Service.prototype.maybeNewLeague = function(u) {
	var me = this,
		leagueIndex = u.get('rating', 'league'),
		leagueMaxPoints = leagueRef.getLeagueByIndex(leagueIndex).points,
		nextLeague = leagueRef.getNextLeague(leagueIndex),
		currentPoints = u.get('rating', 'points');

	if (nextLeague && currentPoints > leagueMaxPoints) {
		u.set('rating', 'league', nextLeague.index);
		return true;
	}
}

/** Перерасчет рейтинга */
Service.prototype.recalcRating = function(callback) {
	var me = this,
		rating;

	callback = callback || function() {};

	mongoose.model('users').find({}, function(err, users) {
		if (err) {
			callback(error.factory('rating', 'recalcRating', 'DB error ' + err, logger));
		} else {

			users = _.sortBy(users, function(user) {
				return 10000000 - user.rating.points;
			});

			rating = []; // рейтинг выстраиваю по лигам
			for(var i = 0; i < leagueRef.data.length; i++) {
				rating[leagueRef.data[i].index] = [];
			}

			for(var i = 0; i < users.length; i++) {
				if (!users[i].get('botId')) {
					rating[users[i].rating.league].push(users[i]); 
				}
			}

			me.rating = rating;
			callback(null);
		}
	});
}

// Создает только один экземпляр класса
Service.getInstance = function(){
    if (!this.instance) {
    	this.instance = new Service();
    }
    return this.instance;
}

module.exports = Service.getInstance();