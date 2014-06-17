var _        = require('underscore'),
    when     = require('when'),
    logger   = require('../helpers').logger,
    errors   = require('../helpers').errors,
    files    = require('../helpers').files,
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
      q = {
        fields: ['title', 'contentType', 'category', 'illustration', 'attachment'],
        from: from,
        size: size,
        sort: [
          "_score",
          { date: {order: "desc"}}
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
 * Download document resources (just images for now).
 * @param {Document} doc
 * @returns {Promise} Promise with doc in params
 */
var downloadResources = function(doc) {
  var m, urls = [], rex = /<img[^>]+src="?([^"\s]+)"?/g;
  while (m = rex.exec(doc.content)) {
    urls.push(m[1]);
  }

  if (urls.length) {
    return download(urls, files.chpath(doc.owner, 'documents', doc._id.toString()))
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

  // Prefix filename by '_' to distinct attachment file and resource file.
  var filename = '_' + files.getHashName(doc.attachment.name);
  return files.chmkdir(doc.owner, 'tmp')
  .then(function(dir) {
    var path = files.chpath(dir, filename);
    return files.chwrite(doc.attachment.stream, path);
  })
  .then(function(file) {
    logger.debug('Attachment saved: ', file);
    doc.attachment = filename;
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
        return files.chmkdir(doc.owner, type, _doc._id.toString()).then(function(dir) {
          return files.chmv(files.chpath(doc.owner, 'tmp', doc.attachment), dir);
        }).then(function() {
          return when.resolve(_doc);
        });
      } else {
        return when.resolve(_doc);
      }
    });
  });

  DocumentSchema.static('update', function(doc, update) {
    var self = this;
    logger.debug('Updating document "%s" %j ...', doc._id, update);
    // Filter title
    if (update.title) update.title = update.title.trim();
    // TODO filter categories
    if (update.categories) {
      if (_.isArray(update.categories)) {
        update.categories = _.filter(update.categories, function(cat) { return /^(user|system)-/.test(cat); });
      } else if (_.isString(update.categories)) {
        update.categories = [update.categories];
      }
    }
    update.date = new Date();
    // Filter updatable attributes.
    update = _.pick(update, 'title', 'date', 'categories', 'content', 'illustration');
    return self.findByIdAndUpdate(doc._id, update).exec()
    .then(function(_doc) {
      logger.info('Document updated: %j', _doc);
      if (update.content) {
        // Download document resources if contente changed
        logger.debug('Updating document\'s resources...');
        return downloadResources(_doc);
      }
      return when.resolve(_doc);
    });
  });

  DocumentSchema.static('del', function(doc) {
    logger.info('Deleting document #%s "%s" of %s ...', doc._id, doc.title, doc.owner);
    return this.remove(doc).exec().then(function() {
      logger.debug('Deleting document #%s files: %s...',
                   doc._id, files.chpath(doc.owner, type, doc._id.toString()));
      return files.chrm(doc.owner, type, doc._id.toString());
    });
  });

  DocumentSchema.static('search', function(uid, params) {
    return elasticsearch.search(type, buildQuery(uid, params));
  });

  return conn.model('Document', DocumentSchema);
};

