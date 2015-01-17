var logger     = require('../../../helpers').logger,
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
   * Detect if the document content is a Pocket JSON.
   * @param {Document} doc
   * @return {Boolean} True if the JSON is Pocket data.
   */
  detect: function(doc) {
    if (typeof doc.content == 'string' || doc.content instanceof String) {
      // Ignore JSON String
      return false;
    }
    return doc.content.resolved_title !== undefined &&
      doc.content.resolved_url !== undefined &&
      doc.content.is_article !== undefined;
  }
};
