var _      = require('underscore'),
    when   = require('when'),
    logger = require('../helpers').logger,
    errors = require('../helpers').errors,
    files  = require('../helpers').files,
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

  DocumentSchema.static('persist', function(doc) {
    logger.debug('Creating document %j ...', doc);
    return this.create(doc).then(function(_doc) {
      if (doc.attachment) {
        // Move attachment to document directory...
        return files.mkdir(doc.owner, 'documents', _doc._id.toString()).then(function(dir) {
          return files.mv(doc.attachment, dir);
        }).then(function() {
          return when.resolve(_doc);
        });
      } else {
        return when.resolve(_doc);
      }
    });
  });

  DocumentSchema.static('del', function(doc) {
    logger.debug('Deleting document %j ...', doc);
    return this.remove(doc).exec().then(function() {
      logger.debug('Deleting document (%s) files...', doc._id);
      return files.rm(doc.owner, 'documents', doc._id.toString());
    });
  });

  DocumentSchema.static('search', function(q) {
    return elasticsearch.search('documents', q);
  });

  return db.model('Document', DocumentSchema);
};

