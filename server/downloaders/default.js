var when       = require('when'),
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
 * Download resources.
 * @param {Array} urls Array of URL
 * @param {String} dest Destination directory
 * @returns {Promise} Promise of download
 */
var download = function(urls, dest) {
  var down = function(_url) {
    if (!validators.isUrl(_url)) {
      return when.reject('Bad URL: ' + _url);
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
    // return when.map(urls, down);
  });
};

/**
 * Standard downloader.
 * @module default
 */
module.exports = download;

