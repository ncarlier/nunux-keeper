var when   = require('when'),
    logger = require('../helpers').logger;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Downloaders.
 * @module downloader
 */
module.exports = function(urls, dest) {
  switch (process.env.APP_DOWNLOADER) {
    case 'async-redis':
      return require('./async-redis')(urls, dest);
    case 'none':
    case 'disabled':
      logger.debug('Resource downloader disabled.');
      return when.resolve();
    default:
      return require('./default')(urls, dest);
  }
};
