var logger     = require('../helpers').logger,
    errors     = require('../helpers').errors,
    validators = require('validator').validators,
    request    = require('request'),
    when       = require('when');

/**
 * URL content extractor.
 */
module.exports = {
  extract: function(doc) {
    logger.debug('Using URL extractor.');
    var extracted = when.defer();
    if (!validators.isUrl(doc.content)) {
      return when.reject(new errors.BadRequest(e.message));
    }
    doc.link = doc.content;

    request.head(doc.link, function (err, res) {
      if (err) return result.reject(err);
      doc.contentType = res.headers['content-type'];
      if (module.parent.exports.support(doc.contentType)) {
        // Get HTTP content...
        module.parent.exports.get(doc.contentType).extract(doc)
        .then(extracted.resolve, extracted.reject);
      } else {
        // HTTP content not supported. Just store URL.
        doc.content = "NOT SUPPORTED";
        extracted.resolve(doc);
      }
    });

    return extracted.promise;
  }
};
