var when   = require('when'),
    logger = require('../helpers').logger;


/**
 * Downloaders.
 * @module downloader
 */
module.exports = function(resources, container) {
  switch (process.env.APP_DOWNLOADER) {
    case 'async-redis':
      return require('./async-redis')(resources, container);
    case 'none':
    case 'disabled':
      logger.debug('Resource downloader disabled.');
      return when.resolve();
    default:
      return require('./default')(resources, container);
  }
};
