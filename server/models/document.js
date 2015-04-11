var _        = require('underscore'),
    when     = require('when'),
    logger   = require('../helpers').logger,
    errors   = require('../helpers').errors,
    storage  = require('../storage'),
    download = require('../downloaders'),
    searchEngine     = require('./search'),
    contentExtractor = require('../extractors');

/**
 * Download document resources.
 * @param {Document} doc
 * @returns {Promise} Promise with doc in params
 */
var downloadResources = function(doc) {
  if (doc.resources.length) {
    return download(doc.resources, storage.getContainerName(doc.owner, 'documents', doc._id.toString(), 'resources'))
    .then(function() {
      return when.resolve(doc);
    }, function() {
      return when.resolve(doc);
    });
  } else {
    return when.resolve(doc);
  }
};

/**
 * Save a document attachment to the owner tmp directory.
 * @param {Document} document
 * @returns {Promise} Promise of the doc with his attachment.
 */
var saveAttachment = function(doc) {
  if (!doc.attachment) {
    return when.resolve(doc);
  }

  return storage.store(
    storage.getContainerName(doc.owner, 'tmp'),
    doc.attachment.name,
    doc.attachment.stream,
    {'Content-Type': doc.attachment.contentType, 'Content-Length': doc.attachment.contentLength}
  ).then(function(file) {
    logger.debug('Attachment saved: ', file);
    doc.attachment = doc.attachment.name;
    return when.resolve(doc);
  }, when.reject);
};

/**
 * Document object model.
 * @module document
 */
module.exports = function(db, conn) {
  searchEngine.configure(conn);

  var DocumentSchema = new db.Schema({
    title:        { type: String, required: true },
    content:      { type: String },
    contentType:  { type: String, required: true },
    categories:   { type: [String] },
    attachment:   { type: String },
    illustration: { type: String },
    resources:    [{
      _id:  false,
      key:  { type: String },
      type: { type: String },
      url:  { type: String }
    }],
    link:         { type: String },
    owner:        { type: String, required: true },
    date:         { type: Date, default: Date.now }
  });

  DocumentSchema.static('extract', function(obj) {
    if (!obj.contentType) {
      return when.reject(new errors.BadRequest('Content-type undefined.'));
    }
    return contentExtractor.get(obj.contentType).extract(obj);
  });

  DocumentSchema.static('persist', function(doc) {
    var self = this;
    logger.debug('Creating document "%s" for %s ...', doc.title, doc.owner);
    // Filter title
    doc.title = doc.title ? doc.title.trim() : 'Undefined';
    // TODO filter categories
    if (_.isArray(doc.categories)) {
      doc.categories = _.filter(doc.categories, function(cat) { return /^(user|system)-/.test(cat); });
    } else if (_.isString(doc.categories)) {
      doc.categories = [doc.categories];
    }

    // Save attachment into tmp directory
    return saveAttachment(doc)
    .then(function(_doc) {
      // Create Document in DB
      return self.create(_doc);
    })
    .then(function(_doc) {
      logger.info('Document created: %j', _doc);
      // Download content ressources
      return downloadResources(_doc);
    })
    .then(function(_doc) {
      if (doc.attachment) {
        // Move attachment to document directory...
        return storage.move(
          storage.getContainerName(doc.owner, 'tmp'),
          doc.attachment,
          storage.getContainerName(doc.owner, 'documents', _doc._id.toString(), 'attachment')
        ).then(function() {
          return when.resolve(_doc);
        });
      } else {
        return when.resolve(_doc);
      }
    });
  });

  DocumentSchema.static('modify', function(doc, update, options) {
    var self = this;
    options = _.defaults(options || {}, {
      updateDate: true
    });
    // Filter title
    if (update.title) update.title = update.title.trim();
    // TODO filter categories
    if (update.categories) {
      if (_.isString(update.categories)) {
        update.categories = [update.categories];
      }
      update.categories = _.filter(update.categories, function(cat) { return /^(user|system)-/.test(cat); });
    }
    var resources = update.resources;
    // Filter updatable attributes.
    update = _.pick(update, 'title', 'categories', 'content', 'illustration');
    // Update date if content is updated
    if (options.updateDate && update.content) {
      update.date = new Date();
    }
    // Reset resources array if content is updated
    if (update.content) {
      update.resources = [];
    }

    logger.debug('Updating document "%s" %j ...', doc._id, update);
    return self.findByIdAndUpdate(doc._id, {$set: update}).exec()
    .then(function(_doc) {
      logger.debug('Document updated: %j', _doc);
      if (update.content) {
        // Updating resources if content is updated
        // It's a big mess but it's the only way until this:
        // https://github.com/LearnBoost/mongoose/pull/585
        logger.debug('Updating document "%s" resources...', _doc._id);
        return self.update(_doc, {$addToSet: {resources: {$each: resources}}}).exec()
        .then(function() {
          return self.findById(doc._id).exec();
        })
        .then(function(d) {
          logger.debug('Document resources updated: %j', d);
          // Download document resources if contente changed
          return downloadResources(d);
        });
      }
      return when.resolve(_doc);
    });
  });

  DocumentSchema.static('del', function(doc) {
    logger.info('Deleting document #%s "%s" of %s ...', doc._id, doc.title, doc.owner);
    return this.remove({_id: doc._id}).exec().then(function() {
      logger.debug('Deleting document #%s files...',
                   doc._id);
      return storage.remove(storage.getContainerName(doc.owner, 'documents', doc._id.toString()));
    });
  });

  DocumentSchema.static('search', function(uid, query) {
    _.defaults(query, {
      q: '',
      from: 0,
      size: 20,
      order: 'desc'
    });
    var match = /^category:([a-z\-]+)$/.exec(query.q);
    var missing = query.q === '_missing_:category';
    var empty = query.q === '';
    if (match || missing || empty ) {
      // If the query is only onto the category,
      // then search directly into the database.
      logger.debug('Searching using database...');
      var self = this;
      var qCount = self.count()
      .where('owner').equals(uid);
      if (match) qCount.where('categories').equals(match[1]);
      if (missing) qCount.where('categories.0').exists(false);
      return qCount.exec()
      .then(function(total) {
        var qFind = self.find()
        .where('owner').equals(uid);
        if (match) qFind.where('categories').equals(match[1]);
        if (missing) qFind.where('categories.0').exists(false);
        return qFind.limit(query.size)
        .skip(query.from)
        .sort(query.order === 'desc' ? '-date' : 'date')
        .select('_id contentType illustration attachment title categories')
        .exec()
        .then(function(hits) {
          return {
            total: total,
            hits: hits
          };
        });
      });
    } else {
      // Pass the query to the search engine
      logger.debug('Searching using the search engine...');
      return searchEngine.searchDocuments(uid, query);
    }
  });

  DocumentSchema.static('downloadResources', downloadResources);

  return conn.model('Document', DocumentSchema);
};

