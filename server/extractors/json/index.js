var logger  = require('../../helpers').logger,
    when    = require('when'),
    greader = require('./googlereader'),
    twitter = require('./twitter');

/**
 * JSON content extractor.
 * This extractor can create multi documents.
 * @module json
 */
module.exports = {
  /**
   * Extract content of a document.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using JSON extractor.');

    if (doc.attachment) {
      // Only GoogleReader exports can be import as an attachment.
      // So try to import...
      return greader.extract(doc);
    } else {
      // Try to analyse JSON to see if content is support...
      if (twitter.detect(doc.content)) {
        // Detect a Tweet JSON.
        return twitter.extract(doc);
      } else {
        // Nothing else to do... forward the doc.
        return when.resolve(doc);
      }
    }
  }
};
