var defaultExtractor = require('./default'),
    htmlExtractor    = require('./html'),
    urlExtractor     = require('./url');
    imageExtractor   = require('./image');

/**
 * Get proper extractor regarding content-type.
 * @param {String} ct - Content type
 * @returns {Module} proper extractor (default if not found)
 */
var getExtractor = function(ct) {
  switch (true) {
    case /^text\/html/.test(ct):
      return htmlExtractor;
    case /^text\/vnd-curl/.test(ct):
      return urlExtractor;
    case /^image\//.test(ct):
      return imageExtractor;
    default:
      return defaultExtractor;
  }
}

/**
 * Content extractors.
 * @module extractors
 */
module.exports = {
  /** @see getExtractor */
  get: getExtractor,
  /**
   * Test if content type is supported.
   */
  support: function(contentType) {
    return getExtractor(contentType) ? true : false;
  }
};
