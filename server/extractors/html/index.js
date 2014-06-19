var when    = require('when'),
    cleaner = require('./cleaner'),
    logger  = require('../../helpers').logger,
    validators  = require('../../helpers').validators,
    readability = require('node-readability');

/**
 * Extract and clean HTML content of a document using Readability.
 * @param {Document} doc
 * @param {Document} extractArticle flag to tell if we have to
 * try to extract the main content
 * @returns {Promise} Promise of the doc with clean HTML content.
 */
var extractHtml = function(doc, extractArticle) {
  var extracted = when.defer();
  readability(doc.content, function(err, read) {
    if (err) return extracted.reject(err);
    cleaner.cleanup(read.document, {baseUrl: doc.link});
    if (extractArticle) {
      // Try to get page main content...
      doc.content = read.document.body.innerHTML;
      var articleContent = read.content;
      if (articleContent) doc.content = articleContent;
    } else {
      // Get content such as
      doc.content = read.document.body.innerHTML;
    }
    if (doc.title === 'Undefined') doc.title = read.title;
    doc.illustration = getIllustration(doc.content);
    extracted.resolve(doc);
  });
  return extracted.promise;
};

/**
 * Retrieve main illustration.
 * @param {String} content HTML content
 * @return {String} illustration URL
 */
var getIllustration = function(content) {
  var rex = /<img[^>]+app\-src="?([^"\s]+)"?/g,
  m = rex.exec(content);

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
        extractHtml(doc, true).then(extracted.resolve, extracted.reject);
      });
      return extracted.promise;
    } else if (doc.content && doc.content !== '') {
      // extract content
      if (validators.isURL(doc.content)) {
        doc.link = doc.content;
      }
      return extractHtml(doc, validators.isURL(doc.content));
    } else if (doc.link) {
      // no content, check if it's a link...
      doc.content = doc.link;
      return extractHtml(doc, true);
    } else {
      return when.reject('Content not found.');
    }
  }
};
