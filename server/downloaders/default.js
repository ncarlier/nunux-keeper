var _        = require('underscore'),
    when       = require('when'),
    nodefn     = require('when/node/function'),
    sequence   = require('when/sequence'),
    dns        = require('dns'),
    url        = require('url'),
    request    = require('request'),
    storage    = require('../storage'),
    validators = require('../helpers').validators,
    logger     = require('../helpers').logger;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Download resources.
 * @param {Array} resources Array of Resource
 * @param {String} container Destination container
 * @returns {Promise} Promise of download
 */
var download = function(resources, container) {
  var down = function(resource) {
    if (!validators.isURL(resource.url)) {
      logger.error('Unable to download %s. Bad URL.', resource.url);
      return when.resolve('Bad URL: ' + resource.url);
    }
    logger.debug('Downloading %s to container %s...', resource.url, container);

    var tryDownload = function() {
      return storage.store(container, resource.key, request(resource.url), {'Content-Type': resource.type});
    };

    var hostname = url.parse(resource.url).hostname;
    return nodefn.call(dns.resolve4, hostname)
    .then(tryDownload, function(e) {
      logger.error('Unable to download %s. Host cannot be resolved: %s', resource.url, hostname);
      return when.reject('Host cannot be resolved: %s', hostname);
    });
  };

  logger.debug('Downloading resources to %s...', container);
  var tasks = [];
  resources.forEach(function(resource) {
    tasks.push(function() { return down(resource); });
  });
  return sequence(tasks)
  .then(function() {
    logger.debug('Cleaning container %s ...', container);
    return storage.cleanContainer(container, resources);
  });
};

/**
 * Standard downloader.
 * @module default
 */
module.exports = download;

