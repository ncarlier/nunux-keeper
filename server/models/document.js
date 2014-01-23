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
 * @param {Object} db Mongoose instance
 * @returns {Object} river configuration
 */
var getRiverConf = function(db) {
  var conf = {
    type: 'mongodb',
    mongodb: {
      servers: [],
      options: { secondary_read_preference: true },
      collection: 'documents'
    },
    index: {
      name: 'documents',
      type: 'document'
    }
  };
  _.each(db.connections, function(conn) {
    conf.mongodb.db = conn.name;
    conf.mongodb.servers.push({
      host: conn.host,
      port: conn.port
    });
  });
  return conf;
};

/**
 * Document mapping configuration.
 */
var mapping = {
  document: {
    _source : {enabled : false},
    properties: {
      title:       {type: 'string', store: 'yes'},
      content:     {type: 'string', store: 'no'},
      contentType: {type: 'string', store: 'yes', index: 'not_analyzed'},
      owner:       {type: 'string', store: 'yes', index: 'not_analyzed'},
      categories:  {type: 'string', store: 'yes', index: 'not_analyzed', index_name: 'category'},
      link:        {type: 'string', store: 'yes'},
      date:        {type: 'date',   store: 'yes', format: 'dateOptionalTime'}
    }
  }
};


/**
 * Build elasticsearch query to find documents.
 * @param {String} owner owner used to filter the query
 * @param {String} q query
 * @returns {Object} query DSL
 */
var buildQuery = function(owner, q) {
  if (!q) {
    return {
      fields: ['title'],
      query: {
        filtered: {
          query: {
            match_all: {}
          },
          filter : { term : { owner : owner } }
        }
      }
    };
  } else {
    return {
      fields: ['title'],
      query: {
        filtered: {
          query: {
            query_string: {
              fields: ['title'],
              query: q
            }
          },
          filter : { term : { owner : owner } }
        }
      }
    };
  }
};

/**
 * Download document resources (just images for now).
 * @param {Document} doc
 * @returns {Promise} Promise with doc in params
 */
var downloadResources = function(doc) {
  var m, urls = [], rex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g;
  while (m = rex.exec(doc.content)) {
    urls.push(m[1]);
  }

  if (urls.length) {
    return download(urls, files.chpath(doc.owner, 'documents', doc._id.toString()))
    .then(function() {
      return when.resolve(doc);
    });
  } else {
    return when.resolve(doc);
  }
};

/**
 * Document object model.
 * @module document
 */
module.exports = function(db) {
  var type = 'documents';

  var DocumentSchema = new db.Schema({
    title:       { type: String, required: true },
    content:     { type: String },
    contentType: { type: String, required: true },
    categories:  { type: [String] },
    link:        { type: String },
    owner:       { type: String, required: true },
    date:        { type: Date, default: Date.now }
  });

  DocumentSchema.static('configure', function() {
    return elasticsearch.configureRiver(getRiverConf(db)).then(function() {
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
    logger.debug('Creating document "%s" for %s ...', doc.title, doc.owner);
    // Filter title
    doc.title = doc.title ? doc.title.trim() : 'Undefined';
    // TODO filter categories
    doc.categories = _.filter(doc.categories, function(cat) { return /^user|system\:/.test(cat); });
    return this.create(doc).then(function(_doc) {
      logger.info('Document created: %j', _doc);
      if (doc.attachment) {
        // Move attachment to document directory...
        return files.chmkdir(doc.owner, type, _doc._id.toString()).then(function(dir) {
          return files.chmv(doc.attachment, dir);
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
    if (update.categories) update.categories = _.filter(update.categories, function(cat) { return /^user|system\:/.test(cat); });
    update.date = new Date();
    // Filter updatable attributes.
    update = _.pick(update, 'title', 'date', 'categories', 'content');
    return self.findByIdAndUpdate(doc._id, update).exec()
    .then(function(_doc) {
      logger.info('Document updated: %j', _doc);
      if (update.content) {
        // Download document resources if contente changed
        logger.debug('Updating document\'s resources...');
        return self.downloadResources(_doc);
      }
      return when.resolve(_doc);
    });
  });

  DocumentSchema.static('downloadResources', downloadResources);

  DocumentSchema.static('del', function(doc) {
    logger.info('Deleting document #%s "%s" of %s ...', doc._id, doc.title, doc.owner);
    return this.remove(doc).exec().then(function() {
      logger.debug('Deleting document #%s files: %s...',
                   doc._id, files.chpath(doc.owner, type, doc._id.toString()));
      return files.chrm(doc.owner, type, doc._id.toString());
    });
  });

  DocumentSchema.static('search', function(uid, q) {
    return elasticsearch.search(type, buildQuery(uid, q));
  });

  return db.model('Document', DocumentSchema);
};

