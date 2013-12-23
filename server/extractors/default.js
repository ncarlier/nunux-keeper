var logger = require('../helpers').logger,
     when  = require('when');

/**
 * Default content extractor.
 */
module.exports = {
  extract: function(doc) {
    logger.debug('Using default extractor.');
    // TODO sanitize body
    return when.resolve(doc);
  }
};
