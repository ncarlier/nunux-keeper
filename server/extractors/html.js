var when   = require('when'),
    fs     = require('fs-extra'),
    url    = require('url'),
    logger = require('../helpers').logger,
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
    // Filter images URLs
    var replacer = function(match, p1, p2, offset, string) {
      if (!/^https?|file|ftps?/i.test(p2)) {
        p2 = url.resolve(doc.link, p2);
      }
      return '<img' + p1 + 'data-src="' + p2 + '"';
    };
    doc.content = article.cache.body.replace(/<img([^>]+)src\s*=\s*['"]([^'"]+)['"]/gi, replacer);
    extracted.resolve(doc);
  });
  return extracted.promise;
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
   * - attached as a file (@see doc.files)
   * - in the body (@see doc.content)
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted HTML.
   */
  extract: function(doc) {
    logger.debug('Using html extractor.');

    if (doc.content && doc.content !== '') {
      // extract content
      if (validators.isUrl(doc.content)) {
        doc.link = doc.content;
      }
      return extractHtml(doc);
    } else if (doc.files) {
      // no content, check if it's a file...
      var file = doc.files[0];
      return nodefn.call(fs.readFile, file.path).then(function(data) {
        doc.content = data;
        return extractHtml(doc);
      }, when.reject);
    } else if (doc.link) {
      // no content, check if it's a link...
      doc.content = doc.link;
      return extractHtml(doc);
    } else {
      return when.reject('Content not found.');
    }
  }
};
