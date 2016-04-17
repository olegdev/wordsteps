/**
 * Модуль обработки ударов. 
 *
 */
define([
	'jquery',
	'underscore',
	'backbone',
	'sockets/sockets',
], function($, _, Backbone, sockets) {

	var queue = [],
		lastHitIndex,
		interval,
		battleViewContainer,
		onFinish;

	var startMonitor = function() {
		var hit;
		interval = setInterval(function() {
			if (canShowHit()) {
				if (hit && hit.callback) {
					hit.callback();
				}
				hit = undefined;
				if (queue.length) {
					hit = showHit(queue.shift());
				}
			}
		}, 100);
	}

	var stopMonitor = function() {
		clearInterval(interval);
	}
	
	var canShowHit = function() {
		return !battleViewContainer.isBusy;
	}

	var showHit = function(data) {
		battleViewContainer.showHit(data.data);
		return data;
	}

	return {
		init: function(battleViewContainerInstance) {
			queue = [];
			lastHitIndex = undefined;
			battleViewContainer = battleViewContainerInstance;
			startMonitor();
		},
		processHit: function(data, callback) {
			if (!lastHitIndex || lastHitIndex +1 == data.hitIndex) {
				lastHitIndex = data.hitIndex;
				queue.push({data: data, callback: callback});	
			} else if (lastHitIndex < data.hitIndex) {
				setTimeout(function() {
					this.processHit(data, callback);
				}, 1000);
			} else {
				// ignore
			}
		},
		stopMonitor: function() {
			stopMonitor();
		}
	};
});