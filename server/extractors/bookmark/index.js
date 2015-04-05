var when       = require('when'),
    fs         = require('fs'),
    url        = require('url'),
    files      = require('../../helpers').files,
    logger     = require('../../helpers').logger,
    errors     = require('../../helpers').errors,
    validators = require('../../helpers').validators,
    thumbnail  = require('../../helpers').thumbnail,
    request    = require('request');

var kRequest = request.defaults({
  headers: {'User-Agent': process.env.APP_USER_AGENT || 'Mozilla/5.0 (compatible; Keeperbot/1.0)'}
});

/**
 * Bookmark extractor.
 * @module url
 */
module.exports = {
  /**
   * Test if the extractor support the provided content-type.
   * @param {String} ct the conten-type
   * @return {Boolean} support status
   */
  support: function(ct) {
    return /^text\/uri;bookmark/.test(ct);
  },
  /**
   * Extract thumbnail of an online HTML document.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using Bookmark extractor.');
    if (!validators.isURL(doc.content)) {
      return when.reject(new errors.BadRequest('URL not valid: ' + doc.content));
    }
    doc.link = doc.content;

    var extracted = when.defer();
    kRequest.head(doc.link, function(err, res) {
      if (err) return extracted.reject(err);
      var contentType = res.headers['content-type'];
      if (!/text\/html/.test(contentType)) {
        return extracted.reject(new errors.BadRequest('Target document is not a regular HTML page.'));
      }
      return thumbnail.page(doc.link)
      .then(function(thumbnailFile) {
        logger.debug('Page thumnailed: ' + thumbnailFile);
        return files.chdu(thumbnailFile)
        .then(function(size) {
          doc.contentType = 'image/png';
          doc.attachment = {
            name: 'capture.png',
            stream: fs.createReadStream(thumbnailFile),
            contentType: 'image/png',
            contentLength: size
          };
          // Get HTTP content...
          return module.parent.exports.get(doc.contentType).extract(doc);
        });
      })
      .then(extracted.resolve, extracted.reject);
    });

    return extracted.promise;
  }
};
