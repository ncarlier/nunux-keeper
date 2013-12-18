var logger = require('../helpers').logger,
     when  = require('when'),
     readability = require('node-readability');

/**
 * HTML content extractor.
 */
module.exports = {
  extract: function(doc) {
    logger.debug('Using html extractor.');
    var extracted = when.defer();
    readability(doc.content, function(err, article) {
      if (err) return extracted.reject(err);
      doc.content = article.cache.body;
      extracted.resolve(doc);
    });

    return extracted.promise;
  }
};
