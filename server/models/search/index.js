var _      = require('underscore'),
    when   = require('when'),
    logger = require('../../helpers').logger,
    errors = require('../../helpers').errors,
    elasticsearch = require('../../helpers').elasticsearch;

var configured = false;

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
  var q = {
    fields: ['title', 'contentType', 'category', 'illustration', 'attachment'],
    from: params.from,
    size: params.size,
    sort: [
      '_score',
      { date: {order: params.order}}
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
 * Search engine.
 * @module search
 */
module.exports = {
  /**
   * Configure the search engine.
   * @param {Object} conn MongoDB connnection
   */
  configure: function(conn) {
    if (process.env.APP_SEARCH_ENGINE === 'disabled') {
      return logger.info('Search engine disabled by configutration.');
    }
    // Configure the river
    elasticsearch.configureRiver(getRiverConf(conn))
    .then(function() {
      // Configure the document mapping
      return elasticsearch.configureMapping('documents', 'document', mapping);
    })
    .then(function() {
      configured = true;
      logger.debug('Great! Elasticsearch seem to be well configured.');
    }, function(err) {
      logger.error('Arghhh! Elasticsearch seem to be misconfigured. Search engine disabled.');
      logger.error(err);
    });
  },

  /**
   * Search Documents.
   * @param {String} uid User ID
   * @param {Object} params serach params
   * @returns {Promise} Promise with the search result in params
   */
  searchDocuments: function(uid, params) {
    if (!configured) {
      return when.reject(
        new errors.BadRequest('Feature disabled: The search engine not configured.')
      );
    }
    return elasticsearch.search('documents', buildQuery(uid, params))
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
  }
};

