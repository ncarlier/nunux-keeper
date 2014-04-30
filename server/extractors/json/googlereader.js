var logger     = require('../../helpers').logger,
    extractors = require('../../extractors'),
    when       = require('when'),
    fs         = require('fs'),
    JSONStream = require('JSONStream');

/**
 * Import new document.
 * @param {Object} data document data
 * @param {Document} parent parent document
 * @return {Promise} Promise of the importation.
 */
var importDocument = function(data, parent) {
  var doc = {
    title: data.title,
    content: data.content ? data.content.content : data.summary ? data.summary.content : '',
    contentType: 'text/html',
    link: data.canonical ? data.canonical[0].href : data.alternate ? data.alternate[0].href : null,
    owner: parent.owner,
    categories: parent.categories
  };
  if (doc.content.indexOf('<') === -1) {
    doc.content = '<p>' + doc.content + '</p>';
  }

  logger.debug('Importing document "%s" ...', doc.title);

  var extracted = when.defer();
  module.parent.parent.exports.get(doc.contentType).extract(doc)
  .then(extracted.resolve, extracted.reject);
  return extracted.promise;
};


/**
 * Import attached JSON.
 * @param {Document} doc document
 * @return {Promise} Promise of the importation.
 */
var importAttachedJSON = function(doc) {
  logger.debug('Import attached JSON %s ...', doc.attachment.name);
  var imported = when.defer(),
      items = [];
  // Parse file...
  var parser = JSONStream.parse('items.*');
  parser.on('end', function(err) {
    when.all(items).then(function(documents) {
      logger.debug('%d documents extracted.', documents.length);
      imported.resolve(documents);
    }, imported.reject);
  });
  parser.on('error', function(err) {
    logger.error('Error while importing file %s of user %s', doc.attachment.name, doc.owner, err);
    items.push(when.reject(err));
  });
  parser.on('data', function(data) {
    items.push(importDocument(data, doc));
  });
  doc.attachment.stream.pipe(parser);

  return imported.promise;
};

/**
 * Google Reader JSON content extractor.
 * This extractor create multi documents.
 * @module googlereader
 */
module.exports = {
  /**
   * Extract content of a GoogleReader export.
   * @param {Document} doc
   * @return {Promise} Promise of extracted documents.
   */
  extract: function(doc) {
    logger.debug('Using GoogleReader exports extractor.');
    return importAttachedJSON(doc);
  }
};
