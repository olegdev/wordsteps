/**
 * Справочник ботов
 *
 */
var Reference = {};
var _ = require('underscore');


// послдение строчки обрабатываются grunt'ом, не менять!

Reference.data = JSON.parse(require('fs').readFileSync(__filename + 'on', 'utf8'));
module.exports = Reference;