var _      = require('underscore'),
    when   = require('when'),
    logger = require('../../helpers').logger;


var foo = function() {
  return when.reject('Not yet implemented.');
};

/**
 * S3 storage driver.
 * @module s3
 */
module.exports = {
  info: foo,
  stream: foo,
  store: foo,
  move: foo,
  remove: foo,
  getContainerName: foo,
  listContainer: foo,
  cleanContainer: foo,
  localCopy: foo,
  localRemove: foo
};

