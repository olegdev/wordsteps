define([		
	'backbone',
], function(Backbone) {

	var Model = Backbone.Model.extend({

		id: '',
		info: {},
		counters: {},
		timed: '',
		bindings: {},
		rating: {},

		initialize: function() {
			//
		},

	});

	return Model;
});