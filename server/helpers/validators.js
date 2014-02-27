var validators = require('validator').validators;

/**
 * Test if string is a valid Document ID.
 * @param {String} str
 */
validators.isDocId = function(str) {
  return /^[0-9a-fA-F]{24}$/.test(str);
};

/**
 * Test if string is a valid public alias.
 * @param {String} str
 */
validators.isPublicAlias = function(str) {
  return /^[0-9a-zA-Z_]{3,128}$/.test(str);
};

/**
 * Validators helper.
 * @extends validator.validators
 * @module validators
 */
module.exports = validators;

