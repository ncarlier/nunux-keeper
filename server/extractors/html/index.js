var when    = require('when'),
    cleaner = require('./cleaner'),
    logger  = require('../../helpers').logger,
    hash    = require('../../helpers').hash,
    validators  = require('../../helpers').validators,
    readability = require('node-readability');

/**
 * Extract base URL from the document head.
 * @param {Object} document DOM
 * @return {String} the base URL in the document head.
 */
var extractBaseUrl = function(document) {
  if (!document.head) return null;
  var base = document.head.getElementsByTagName('base')[0];
  if (base && base.hasAttribute('href')) {
    var baseUrl = base.getAttribute('href');
    if (/^\/\//i.test(baseUrl)) baseUrl = 'http:' + baseUrl;
    logger.debug('Base URL found in the head: %s', baseUrl);
    return baseUrl;
  } else {
    return null;
  }
};

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
    var baseUrl = extractBaseUrl(read.document) || doc.link;
    cleaner.cleanup(read.document, {baseUrl: baseUrl});
    if (extractArticle) {
      // Try to get page main content...
      doc.content = read.document.body.innerHTML;
      var articleContent = read.content;
      if (articleContent) doc.content = articleContent;
    } else {
      // Get content such as
      doc.content = read.document.body.innerHTML;
    }
    if (!doc.title && read.title) doc.title = read.title;
    doc.resources = extractResources(doc.content);
    if (doc.resources.length) {
      doc.illustration = doc.resources[0].url;
    }
    extracted.resolve(doc);
  });
  return extracted.promise;
};

/**
 * Extract resources from document content.
 * For now, only images are extracted.
 * @param {String} content HTML content
 * @return {Object} resources
 */
var extractResources = function(content) {
  var m, resource = [], rex = /<img[^>]+src="?([^"\s]+)"?/g;
  while ((m = rex.exec(content)) !== null) {
    var url = m[1];
    resource.push({
      key: hash.hashUrl(url),
      type: 'image',
      url: url
    });
  }
  return resource;
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
