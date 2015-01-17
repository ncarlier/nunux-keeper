var logger     = require('../../../helpers').logger,
    when       = require('when');

/**
 * Twitter JSON content extractor.
 * @module twitter
 */
module.exports = {
  /**
   * Extract content of a Tweet.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using Twitter JSON extractor.');
    var tweet = doc.content;
    doc.title = 'From @' + tweet.user.screen_name;
    doc.contentType = 'text/html';
    doc.link = 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str;
    doc.content = '<p>' + tweet.text + '</p>';
    return when.resolve(doc);
  },

  /**
   * Detect if the document content is a Tweet JSON.
   * @param {Document} doc
   * @return {Boolean} True if the JSON is a Tweet.
   */
  detect: function(doc) {
    if (typeof doc.content == 'string' || doc.content instanceof String) {
      // Ignore JSON String
      return false;
    }
    return doc.content.retweeted !== undefined &&
      doc.content.id !== undefined &&
      doc.content.text !== undefined;
  }
};
