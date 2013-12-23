var logger = require('../helpers').logger,
    errors = require('../helpers').errors,
    when   = require('when'),
    elasticsearch    = require('../helpers').elasticsearch,
    contentExtractor = require('../extractors');

/**
 * Document object model.
 */
module.exports = function(db) {
  var DocumentSchema = new db.Schema({
    title:       { type: String, required: true },
    content:     { type: String },
    contentType: { type: String, required: true },
    link:        { type: String },
    owner:       { type: String, required: true },
    date:        { type: Date, default: Date.now }
  });

  DocumentSchema.static('extract', function(obj) {
    if (!obj.contentType) {
      return when.reject(new errors.BadRequest('Content-type undefined.'));
    }
    return contentExtractor.get(obj.contentType).extract(obj);
  });

  DocumentSchema.static('search', function(q) {
    return elasticsearch.search('documents', q);
  });

  return db.model('Document', DocumentSchema);
};

