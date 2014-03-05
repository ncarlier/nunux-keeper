var redis   = require('redis');


/**
 * Get Redis URI.
 * @return {String} Redis string URI
 */
var getRedisUri = function() {
  var uri = 'redis://localhost:6379/9';
  if (process.env.APP_REDIS_URI) {
    uri = process.env.APP_REDIS_URI;
  } else if (process.env.REDIS_PORT) { // Docker
    uri = process.env.REDIS_PORT.replace(/^tcp/, 'redis');
    uri = uri + '/9';
  }
  return uri;
};

/**
 * Connect to redis.
 * @param {String} str Redis string URI
 */
var connect = function(str) {
  var match = /^redis:\/\/([a-z0-9\.]+):(\d+)\/(\d)$/.exec(str);
  if (!match) {
    throw new Error('Invalid redis uri: ' + str);
  }
  var host = match[1],
      port = parseInt(match[2]),
      db   = parseInt(match[3]);

  var redisClient = redis.createClient(port, host);
  redisClient.select(db);
  return redisClient;
};

/**
 * Redis helper.
 * @module redis
 */
module.exports = connect(getRedisUri());


