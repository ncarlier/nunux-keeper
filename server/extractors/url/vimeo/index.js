var logger = require('../../../helpers').logger,
    url    = require('url'),
    when   = require('when');

/**
 * Vimeo URL content extractor.
 * @module vimeo
 */
module.exports = {
  /**
   * Extract content of Vimeo URL.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using Vimeo URL extractor.');

    var u = url.parse(doc.link),
        v = u.pathname.split('/')[1];
    doc.content = '<iframe src="//player.vimeo.com/video/' + v + '" ';
    doc.content += 'width="500" height="281" frameborder="0" ';
    doc.content += 'webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    doc.title = 'Vimeo video: ' + v;
    doc.contentType = 'text/html';
    return when.resolve(doc);
  },

  /**
   * Detect if the document content is a Vimeo URL.
   * @param {Document} doc
   * @return {Boolean} True if the URL is from Vimeo.
   */
  detect: function(doc) {
    return doc.link.lastIndexOf('http://vimeo.com', 0) === 0;
  }
};
