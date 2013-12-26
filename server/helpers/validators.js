var validators = require('validator').validators;

/**
 * Test if string is a valid Document ID.
 * @param {String} str
 */
validators.isDocId = function(str) {
  return /^[0-9a-fA-F]{24}$/.test(str);
};

/**
 * Validators helper.
 * @extends validator.validators
 * @module validators
 */
module.exports = validators;

