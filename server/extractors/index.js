var logger = require('../helpers').logger,
    path   = require('path'),
    when   = require('when');

// Load extractors
var extractors = {};
require('fs').readdirSync(__dirname).forEach(function (file) {
  if (file === 'index.js') return;
  var name = path.basename(file, '.js');
  extractors[name] = require(path.join(__dirname, file));
  logger.debug('%s extractor registered.', name.toUpperCase());
});

/**
 * Get proper extractor regarding content-type.
 * @param {String} ct Content type
 * @returns {Module} proper extractor (null if not found)
 */
var getExtractor = function(ct) {
  var extractor = null;
  for (var ext in extractors) {
    if (extractors[ext].support && extractors[ext].support(ct)) {
      extractor = extractors[ext];
      break;
    }
  }
  return extractor;
};

/**
 * Default content extractor.
 */
var defaultExtractor = {
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

/**
 * Content extractors.
 * @module extractors
 */
module.exports = {
  /** @see getExtractor */
  get: function(contentType) {
    var extractor = getExtractor(contentType);
    if (extractor) return extractor;
    else {
      logger.debug('No extractor found for content-type: ' + contentType);
      return defaultExtractor;
    }
  },
  /**
   * Test if content type is supported.
   */
  support: function(contentType) {
    return getExtractor(contentType) !== null;
  }
};
