/**
 * Модель слова
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	value: String,
});
var model = mongoose.model('words', schema);

module.exports = model;