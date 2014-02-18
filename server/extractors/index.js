var defaultExtractor = require('./default'),
    htmlExtractor    = require('./html'),
    urlExtractor     = require('./url'),
    fileExtractor    = require('./file'),
    jsonExtractor    = require('./json');

/**
 * Get proper extractor regarding content-type.
 * @param {String} ct - Content type
 * @returns {Module} proper extractor (default if not found)
 */
var getExtractor = function(ct) {
  switch (true) {
    case /^text\/html/.test(ct):
      return htmlExtractor;
    case /^application\/json/.test(ct):
      return jsonExtractor;
    case /^text\/vnd\.curl/.test(ct):
      return urlExtractor;
    case /^multipart\/form-data/.test(ct):
      return fileExtractor;
    default:
      return null;
  }
};

/**
 * Content extractors.
 * @module extractors
 */
module.exports = {
  /** @see getExtractor */
  get: function(contentType) {
    return getExtractor(contentType) || defaultExtractor;
  },
  /**
   * Test if content type is supported.
   */
  support: function(contentType) {
    return getExtractor(contentType) ? true : false;
  }
};
