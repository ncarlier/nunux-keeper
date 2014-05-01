var validator = require('validator');

/**
 * Test if string is a valid Document ID.
 * @param {String} str
 */
validator.isDocId = function(str) {
  return /^[0-9a-fA-F]{24}$/.test(str);
};

/**
 * Test if string is a valid public alias.
 * @param {String} str
 */
validator.isPublicAlias = function(str) {
  return /^[0-9a-zA-Z_]{3,128}$/.test(str);
};

/**
 * Validators helper.
 * @extends validator
 * @module validators
 */
module.exports = validator;

