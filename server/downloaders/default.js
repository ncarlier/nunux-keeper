var when       = require('when'),
    request    = require('request'),
    files      = require('../helpers').files,
    validators = require('../helpers').validators,
    logger     = require('../helpers').logger;


/**
 * Download resources.
 * @param {Array} urls Array of URL
 * @param {String} dest Destination directory
 * @returns {Promise} Promise of download
 */
var download = function(urls, dest) {
  var down = function(url) {
    if (!validators.isUrl(url)) {
      return when.resolve('Bad URL: ' + url);
    }
    var to = files.chpath(dest, files.getHashName(url));
    logger.debug('Downloading %s to %s...', url, to);
    return files.chwrite(request(url), to);
  };

  return files.chmkdir(dest)
  .then(function() {
    return when.map(urls, down);
  });
};

/**
 * Standard downloader.
 * @module default
 */
module.exports = download;

