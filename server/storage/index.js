var logger = require('../helpers').logger;


var storageDriver;
/**
 * Storage drivers.
 * @module drivers
 */
switch (process.env.APP_STORAGE) {
  case 's3':
    logger.debug('Using S3 as resources storage.');
    storageDriver = require('./drivers/s3');
    break;
  default:
    logger.debug('Using local file system as resources storage.');
    storageDriver = require('./drivers/local');
}

module.exports = storageDriver;
