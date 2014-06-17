var _        = require('underscore'),
    when       = require('when'),
    nodefn     = require('when/node/function'),
    sequence   = require('when/sequence'),
    dns        = require('dns'),
    url        = require('url'),
    request    = require('request'),
    files      = require('../helpers').files,
    validators = require('../helpers').validators,
    logger     = require('../helpers').logger;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Clean destination directory.
 * Remove all hash files not in the URL list.
 */
var cleanDirectory = function(dir, urls) {
  // Create hash list
  var hashList = _.map(urls, function(_url) {
    return files.getHashName(_url);
  });

  // List directory content...
  return files.chls(dir)
  .then(function(entries) {
    // Get delta between directory content and hash list
    var delta = _.difference(entries, hashList);
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
 * @param {Array} urls Array of URL
 * @param {String} dest Destination directory
 * @returns {Promise} Promise of download
 */
var download = function(urls, dest) {
  var down = function(_url) {
    if (!validators.isURL(_url)) {
      logger.error('Unable to download %s. Bad URL.', _url);
      return when.resolve('Bad URL: ' + _url);
    }
    var to = files.chpath(dest, files.getHashName(_url));

    logger.debug('Downloading %s to %s...', _url, to);

    var tryDownload = function() {
      return files.chwrite(request(_url), to);
    };

    var hostname = url.parse(_url).hostname;
    return nodefn.call(dns.resolve4, hostname)
    .then(tryDownload, function(e) {
      logger.error('Unable to download %s. Host cannot be resolved: %s', _url, hostname);
      return when.reject('Host cannot be resolved: %s', hostname);
    });
  };

  return files.chmkdir(dest)
  .then(function() {
    var tasks = [];
    urls.forEach(function(url) {
      tasks.push(function() { return down(url); });
    });
    return sequence(tasks);
  })
  .then(function() {
    logger.debug('Cleaning directory %s ...', dest);
    return cleanDirectory(dest, urls);
  });
};

/**
 * Standard downloader.
 * @module default
 */
module.exports = download;

