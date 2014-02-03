var logger = require('../helpers').logger,
    when   = require('when');

/**
 * Default content extractor.
 * @module default
 */
module.exports = {
  /**
   * Extract content of a document.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using default extractor.');
    // TODO sanitize body
    return when.resolve(doc);
  }
};
