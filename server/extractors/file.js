var when     = require('when'),
    fs       = require('fs'),
    logger   = require('../helpers').logger;

/**
 * Import file.
 * @param {File} file file to import
 * @param {Document} doc attached doc
 * @return {Promise} Promise of the importation.
 */
var importFile = function(file, doc) {
  logger.debug('Saving file %s for user %s ...', file.originalFilename, doc.owner);
  doc.contentType = file.headers['content-type'];
  var ext = file.originalFilename.split('.').pop();
  if (doc.contentType === 'application/octet-stream' && ext === 'json') {
    doc.contentType = 'application/json';
  }
  doc.attachment = {
    name: file.originalFilename,
    stream: fs.createReadStream(file.path)
  };
  // Get content...
  return module.parent.exports.get(doc.contentType).extract(doc);
};

/**
 * File content extractor.
 * @module file
 */
module.exports = {
  /**
   * Extract uploaded content of a document.
   * If content-type is not supported, document is return as is.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using File extractor.');
    if (doc.files && Object.keys(doc.files).length) {
      // TODO import multi files
      //var imported = [];
      for(var file in doc.files) {
        //imported.push(importFile(doc.files[file], doc));
        return importFile(doc.files[file], doc);
      }
      //return when.all(imported);
    } else {
      logger.debug('No attached files. Try to use default extractor.');
      return module.parent.exports.get(null).extract(doc);
    }
  }
};
