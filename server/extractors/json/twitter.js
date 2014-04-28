var logger     = require('../../helpers').logger,
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
   * Detect if the JSON is a Tweet JSON.
   * @param {Object} json JSON to test
   * @return {Boolean} True if the JSON is a Tweet.
   */
  detect: function(json) {
    if (typeof json == 'string' || json instanceof String) {
      // Ignore JSON String
      return false;
    }
    return json.retweeted !== undefined &&
      json.id !== undefined &&
      json.text !== undefined;
  }
};
