/**
 * Модель словаря
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	version: Number,
	words: Array,
});
var model = mongoose.model('dictionary', schema);

module.exports = model;