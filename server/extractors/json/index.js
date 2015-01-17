var logger = require('../../helpers').logger,
    path   = require('path'),
    when   = require('when');

// Load json extractors
var jsonExtractors = {};
require('fs').readdirSync(__dirname).forEach(function (file) {
  if (file === 'index.js') return;
  var name = path.basename(file, '.js');
  jsonExtractors[name] = require(path.join(__dirname, file));
  logger.debug('JSON extractor %s registered.', name);
});

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
    // Default extractor
    var extractor = {
      extract: function(doc) {
        return when.resolve(doc);
      }
    };
    for (var ext in jsonExtractors) {
      if (jsonExtractors[ext].detect(doc)) {
        extractor = jsonExtractors[ext];
        break;
      }
    }
    return extractor.extract(doc);
  }
};
