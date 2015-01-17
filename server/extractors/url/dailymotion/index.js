var logger = require('../../../helpers').logger,
    url    = require('url'),
    when   = require('when');

/**
 * Dailymotion URL content extractor.
 * @module youtube
 */
module.exports = {
  /**
   * Extract content of Dailymotion URL.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using Dailymotion URL extractor.');

    var u = url.parse(doc.link),
        v = u.pathname.split('/')[2];
    doc.content = '<iframe frameborder="0" width="480" height="270" ';
    doc.content += 'src="//www.dailymotion.com/embed/video/' + v + '" ';
    doc.content += 'allowfullscreen></iframe>';
    doc.title = 'Dailymotion video: ' + v;
    doc.contentType = 'text/html';
    return when.resolve(doc);
  },

  /**
   * Detect if the document content is a Dailymotion URL.
   * @param {Document} doc
   * @return {Boolean} True if the URL is from Dailymotion.
   */
  detect: function(doc) {
    return doc.link.lastIndexOf('http://www.dailymotion.com/video/', 0) === 0;
  }
};
