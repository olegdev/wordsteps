define([		
	'backbone',
], function(Backbone) {

	var Model = Backbone.Model.extend({

		// @attributes
		// side,
		// fieldSize,
		// battle,

		initialize: function() {
			//
		},

		getSideInfo: function(side) {
			if (side == 1) {
				return this.attributes.battle.side1;
			} else {
				return this.attributes.battle.side2;
			}
		},

		getFieldSize: function() {
			return this.attributes.battle.fieldSize;
		}

	});

	return Model;
});