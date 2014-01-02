var _      = require('underscore'),
    when   = require('when'),
    files  = require('../helpers').files,
    redis  = require('../helpers').redis,
    logger = require('../helpers').logger;


/**
 * Download resources.
 * Send resources to Redis queue.
 * @param {Array} urls Array of URL
 * @param {String} dest Destination directory
 * @returns {Promise} Promise of download
 */
var download = function(urls, dest) {
  var data = _.map(urls, function(url) {
    return JSON.stringify({
      src: url,
      dest: files.chpath(dest, files.getHashName(url))
    });
  });
  logger.debug('Delegating downloading with redis: %j ...', data);
  var sended = when.defer();
  redis.rpush('resources:download', data, function(err) {
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

