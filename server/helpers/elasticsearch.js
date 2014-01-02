var when    = require('when'),
    logger  = require('./logger'),
    request = require('request');

var uri = process.env.APP_ELASTICSEARCH_URI || 'http://localhost:9200';

/**
 * Get Elasticsearch river status.
 * @param {String} name river name
 * @returns {Object} Promise with river status in parameter
 */
var getRiverStatus = function(name) {
  var status = when.defer();
  request.get({
    url: uri + '/_river/' + name + '/_status',
    json: true
  }, function (err, res, data) {
    if (err) return status.reject(err);
    if (res.statusCode >= 400) return status.reject(data);
    status.resolve(data);
  });
  return status.promise;
};

/**
 * Configure ElasticSearch river.
 * @param {Object} river river configuration
 * @returns {Promise} Promise of the configuration
 */
var configureRiver = function(river) {
  var riverName = river.mongodb.db;
  return getRiverStatus(riverName).then(function(status) {
    if (status.exists) return when.resolve();
    logger.debug('Configuring Elasticsearch river %s...', riverName);
    var configured = when.defer();
    request.put({
      url: uri + '/_river/' + riverName + '/_meta',
      body: river,
      json: true
    }, function (err, res, data) {
      if (err) return configured.reject(err);
      if (res.statusCode >= 400) return configured.reject(data);
      logger.debug('Elasticsearch river configured: %j', data);
      configured.resolve(data);
    });
    return configured.promise;
  });
};

/**
 * Configure ElasticSearch mapping.
 * @param {String} index index name
 * @param {Object} type type mapping type
 * @param {Object} mapping mapping configuration
 * @returns {Promise} Promise with configuration status as parameter
 */
var configureMapping = function(index, type, mapping) {
  logger.debug('Configuring Elasticsearch mapping for %s...', index);
  var configured = when.defer();
  request.put({
    url: uri + '/' + index + '/' + type + '/_mapping',
    body: mapping,
    json: true
  }, function (err, res, data) {
    if (err) return configured.reject(err);
    if (res.statusCode >= 400) return configured.reject(data);
    logger.debug('Elasticsearch mapping for %s configured: %j', index, data);
    configured.resolve(data);
  });
  return configured.promise;
};

/**
 * Search with ElasticSearch.
 * @param {String} index index name
 * @param {Object} q query
 * @returns {Promise} Promise with serach result as parameter
 */
var search = function(index, q) {
  var result = when.defer();
  request.post({
    url: uri + '/' + index + '/_search',
    body: q,
    json: true
  }, function (err, res, data) {
    if (err) return result.reject(err);
    if (res.statusCode >= 400) return result.reject(data);
    result.resolve(data);
  });
  return result.promise;
};


/**
 * ElasticSearch helper.
 * @module elasticsearch
 */
module.exports = {
  /** @see configureRiver() */
  configureRiver: configureRiver,
  /** @see configureMapping() */
  configureMapping: configureMapping,
  /** @see search() */
  search: search,
};

