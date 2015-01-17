var logger = require('../../../helpers').logger,
    url    = require('url'),
    when   = require('when');

/**
 * Youtube URL content extractor.
 * @module youtube
 */
module.exports = {
  /**
   * Extract content of Youtube URL.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using Youtube URL extractor.');

    var u = url.parse(doc.link, true),
        v = u.query.v;
    doc.content = '<iframe width="560" height="315" ';
    doc.content += 'src="//www.youtube.com/embed/' + v + '" ';
    doc.content += 'frameborder="0" allowfullscreen></iframe>';
    doc.title = 'Youtube video: ' + v;
    doc.contentType = 'text/html';
    return when.resolve(doc);
  },

  /**
   * Detect if the document content is a Youtube URL.
   * @param {Document} doc
   * @return {Boolean} True if the URL is from Youtube.
   */
  detect: function(doc) {
    return doc.link.lastIndexOf('https://www.youtube.com/watch', 0) === 0;
  }
};
