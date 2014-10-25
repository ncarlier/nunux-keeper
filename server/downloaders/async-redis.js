var _      = require('underscore'),
    when   = require('when'),
    redis  = require('../helpers/redis'),
    logger = require('../helpers').logger;


/**
 * Download resources.
 * Send resources to Redis queue.
 * @param {Array} resources Array of Resource
 * @param {String} dest Destination directory
 * @returns {Promise} Promise of download
 */
var download = function(resources, dest) {
  var data = {
    dest: dest,
    resources: resources
  };

  logger.debug('Delegating downloading with redis: %j ...', data);
  var sended = when.defer();
  redis.rpush('resources:download', JSON.stringify(data), function(err) {
    if (err) return sended.reject(err);
    return sended.resolve();
  });
  return sended.promise;
};

/**
 * Async downloader using Redis.
 * @module asyncredis
 */
module.exports = download;

