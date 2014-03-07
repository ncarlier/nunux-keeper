var when   = require('when'),
    logger = require('../helpers').logger,
    filter = require('../helpers').filter,
    validators  = require('../helpers').validators,
    readability = require('node-readability');

/**
 * Extract and clean HTML content of a document using Readability.
 * @param {Document} doc
 * @returns {Promise} Promise of the doc with clean HTML content.
 */
var extractHtml = function(doc) {
  var extracted = when.defer();
  readability(doc.content, function(err, article) {
    if (err) return extracted.reject(err);
    doc.content = filter(article.cache.body, doc.link);
    if (doc.title === 'Undefined') doc.title = article.title;
    doc.illustration = extractIllustration(doc);
    extracted.resolve(doc);
  });
  return extracted.promise;
};

/**
 * Extract illustration from document content.
 * @param {Document} document
 * @returns {String} doc illustration.
 */
var extractIllustration = function(doc) {
  var rex = /<img[^>]+app\-src="?([^"\s]+)"?/g,
      m = rex.exec(doc.content);

  return m ? m[1] : null;
};

/**
 * HTML content extractor.
 * @module html
 */
module.exports = {
  /**
   * Extract HTML content a document.
   * HTML can be :
   * - refered as a link (@see doc.link or doc.content)
   * - attached as a file (@see doc.attachment)
   * - in the body (@see doc.content)
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted HTML.
   */
  extract: function(doc) {
    logger.debug('Using html extractor.');

    if (doc.attachment) {
      var extracted = when.defer();
      var bufs = [];
      doc.attachment.stream.on('data', function(d){ bufs.push(d); });
      doc.attachment.stream.on('end', function() {
        doc.content = Buffer.concat(bufs).toString();
        doc.attachment = null;
        extractHtml(doc).then(extracted.resolve, extracted.reject);
      });
      return extracted.promise;
    } else if (doc.content && doc.content !== '') {
      // extract content
      if (validators.isUrl(doc.content)) {
        doc.link = doc.content;
      }
      return extractHtml(doc);
    } else if (doc.link) {
      // no content, check if it's a link...
      doc.content = doc.link;
      return extractHtml(doc);
    } else {
      return when.reject('Content not found.');
    }
  }
};
