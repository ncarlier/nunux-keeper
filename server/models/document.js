var _        = require('underscore'),
    when     = require('when'),
    logger   = require('../helpers').logger,
    errors   = require('../helpers').errors,
    hash     = require('../helpers').hash,
    storage  = require('../storage'),
    download = require('../downloaders'),
    elasticsearch    = require('../helpers').elasticsearch,
    contentExtractor = require('../extractors');

/**
 * Get documents river configuration.
 * @param {Object} conn Mongoose connection
 * @returns {Object} river configuration
 */
var getRiverConf = function(conn) {
  var conf = {
    type: 'mongodb',
    mongodb: {
      db: conn.name,
      servers: [{
        host: conn.host,
        port: conn.port
      }],
      options: { secondary_read_preference: true },
      collection: 'documents'
    },
    index: {
      name: 'documents',
      type: 'document'
    }
  };
  return conf;
};

/**
 * Document mapping configuration.
 * TODO illustration should be replace by first image resource
 * But to do this we should use ES 1.3 mapping transform feature.
 * @see http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/mapping-transform.html
 */
var mapping = {
  document: {
    _source : {enabled : false},
    properties: {
      title:        {type: 'string', store: 'yes'},
      content:      {type: 'string', store: 'no'},
      contentType:  {type: 'string', store: 'yes', index: 'not_analyzed'},
      owner:        {type: 'string', store: 'yes', index: 'not_analyzed'},
      categories:   {type: 'string', store: 'yes', index: 'not_analyzed', index_name: 'category'},
      attachment:   {type: 'string', store: 'yes', index: 'not_analyzed'},
      illustration: {type: 'string', store: 'yes', index: 'not_analyzed'},
      link:         {type: 'string', store: 'yes'},
      date:         {type: 'date',   store: 'yes', format: 'dateOptionalTime'}
    }
  }
};


/**
 * Build elasticsearch query to find documents.
 * @param {String} owner owner used to filter the query
 * @param {String} q query
 * @returns {Object} query DSL
 */
var buildQuery = function(owner, params) {
  var from = params.from ? params.from : 0,
      size = params.size ? params.size : 20,
      order = params.order ? params.order : 'desc';
  var q = {
    fields: ['title', 'contentType', 'category', 'illustration', 'attachment'],
    from: from,
    size: size,
    sort: [
      '_score',
      { date: {order: order}}
    ],
    query: {
      filtered: {
        query: { match_all: {} },
        filter : { term : { owner : owner } }
      }
    }
  };

  if (params.q) {
    q.query.filtered.query = {
      query_string: {
        fields: ['title^5', 'category^4', 'content'],
        query: params.q
      }
    };
  }

  return q;
};

/**
 * Download document resources.
 * @param {Document} doc
 * @returns {Promise} Promise with doc in params
 */
var downloadResources = function(doc) {
  if (doc.resources.length) {
    return download(doc.resources, storage.getContainerName(doc.owner, 'documents', doc._id.toString()))
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

  return storage.store(storage.getContainerName(doc.owner, 'tmp'), doc.attachment.name, doc.attachment.stream)
  .then(function(file) {
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
  var type = 'documents';

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

  DocumentSchema.static('configure', function() {
    return elasticsearch.configureRiver(getRiverConf(conn)).then(function() {
      return elasticsearch.configureMapping(type, 'document', mapping);
    });
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
          storage.getContainerName(doc.owner, 'documents', _doc._id.toString() + '_attachment')
        ).then(function() {
          return when.resolve(_doc);
        });
      } else {
        return when.resolve(_doc);
      }
    });
  });

  DocumentSchema.static('modify', function(doc, update) {
    var self = this;
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
    if (update.content) {
      update.date = new Date();
      update.resources = [];
    }

    logger.debug('Updating document "%s" %j ...', doc._id, update);
    return self.findByIdAndUpdate(doc._id, {$set: update}).exec()
    .then(function(_doc) {
      logger.info('Document updated: %j', _doc);
      if (update.content) {
        // Updating resources if content is updated
        // It's a big mess but it's the only way until this:
        // https://github.com/LearnBoost/mongoose/pull/585
        logger.debug('Updating document "%s" resources...', _doc._id);
        return self.update(_doc, {$addToSet: {resources: resources}}).exec()
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
      return storage.remove(storage.getContainerName(doc.owner, type, doc._id.toString()));
    });
  });

  DocumentSchema.static('search', function(uid, params) {
    return elasticsearch.search(type, buildQuery(uid, params))
    .then(function(data) {
      var result = {};
      result.total = data.hits.total;
      result.hits = [];
      data.hits.hits.forEach(function(hit) {
        var doc = {_id: hit._id};
        for (var field in hit.fields) {
          doc[field] = _.isArray(hit.fields[field]) ? hit.fields[field][0] : hit.fields[field];
        }
        result.hits.push(doc);
      });
      return when.resolve(result);
    });
  });

  return conn.model('Document', DocumentSchema);
};

