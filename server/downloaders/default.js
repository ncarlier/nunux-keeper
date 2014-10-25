var _        = require('underscore'),
    when       = require('when'),
    nodefn     = require('when/node/function'),
    sequence   = require('when/sequence'),
    dns        = require('dns'),
    url        = require('url'),
    request    = require('request'),
    files      = require('../helpers').files,
    hash       = require('../helpers').hash,
    validators = require('../helpers').validators,
    logger     = require('../helpers').logger;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Clean destination directory.
 * Remove all hash files not in the resource list.
 */
var cleanDirectory = function(dir, resources) {
  var keys = _.pluck(resources, 'key');

  // List directory content...
  return files.chls(dir)
  .then(function(entries) {
    // Get delta between directory content and key list
    var delta = _.difference(entries, keys);
    return when.map(delta, function(entry) {
      // Ignore files prefixed by '_' (attachment file)
      if (entry.indexOf('_') === 0) return null;
      // Remove file not in hash list.
      logger.debug('Removing unused resource: %s ...', entry);
      return files.chrm(files.chpath(dir, entry));
    });
  });
};

/**
 * Download resources.
 * @param {Array} resources Array of Resource
 * @param {String} dest Destination directory
 * @returns {Promise} Promise of download
 */
var download = function(resources, dest) {
  var down = function(resource) {
    if (!validators.isURL(resource.url)) {
      logger.error('Unable to download %s. Bad URL.', resource.url);
      return when.resolve('Bad URL: ' + resource.url);
    }
    // TODO use resource.type in the destination path
    var to = files.chpath(dest, resource.key);

    logger.debug('Downloading %s to %s...', resource.url, to);

    var tryDownload = function() {
      return files.chwrite(request(resource.url), to);
    };

    var hostname = url.parse(resource.url).hostname;
    return nodefn.call(dns.resolve4, hostname)
    .then(tryDownload, function(e) {
      logger.error('Unable to download %s. Host cannot be resolved: %s', resource.url, hostname);
      return when.reject('Host cannot be resolved: %s', hostname);
    });
  };

  logger.debug('Downloading resources to %s...', dest);
  return files.chmkdir(dest)
  .then(function() {
    var tasks = [];
    resources.forEach(function(resource) {
      tasks.push(function() { return down(resource); });
    });
    return sequence(tasks);
  })
  .then(function() {
    logger.debug('Cleaning directory %s ...', dest);
    return cleanDirectory(dest, resources);
  });
};

/**
 * Standard downloader.
 * @module default
 */
module.exports = download;

