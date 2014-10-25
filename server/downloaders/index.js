var when   = require('when'),
    logger = require('../helpers').logger;


/**
 * Downloaders.
 * @module downloader
 */
module.exports = function(resources, dest) {
  switch (process.env.APP_DOWNLOADER) {
    case 'async-redis':
      return require('./async-redis')(resources, dest);
    case 'none':
    case 'disabled':
      logger.debug('Resource downloader disabled.');
      return when.resolve();
    default:
      return require('./default')(resources, dest);
  }
};
