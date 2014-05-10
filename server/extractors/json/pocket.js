var logger     = require('../../helpers').logger,
    when       = require('when');

/**
 * Pocket JSON content extractor.
 * @module pocket
 */
module.exports = {
  /**
   * Extract content of Pocket data.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using Pocket JSON extractor.');
    var data = doc.content;
    doc.title = data.resolved_title;
    doc.contentType = 'text/html';
    doc.link = data.resolved_url;
    var images = '';
    if (/*data.has_image === '1' ||*/ data.has_image === 2) {
      for (var i in data.images) {
        var img = data.images[i];
        content += '<img src="' + img.src + '" />';
      }
    }

    doc.content = '<p>Imported from Pocket.</p>';
    doc.content += (data.is_article === '1') ? '<p>' + data.excerpt + '</p>' : '';
    doc.content += images;
    return when.resolve(doc);
  },

  /**
   * Detect if the JSON is a Pocket JSON.
   * @param {Object} json JSON to test
   * @return {Boolean} True if the JSON is Pocket data.
   */
  detect: function(json) {
    if (typeof json == 'string' || json instanceof String) {
      // Ignore JSON String
      return false;
    }
    return json.resolved_title !== undefined &&
      json.resolved_url !== undefined &&
      json.is_article !== undefined;
  }
};
