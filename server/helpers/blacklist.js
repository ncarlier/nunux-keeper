var fs     = require('fs'),
    files  = require('./files'),
    logger = require('./logger');

var blacklist = [];

/**
 * Add URL to the blacklist.
 * @param {String} url URL
 */
var blacklistUrl = function(url) {
  blacklist.push(url);
};

/**
 * Generic function to read lines of text file.
 * @param {Stream} input input stream
 * @param {Function} func function to apply on each line
 */
var readLines = function(input, func) {
  var remaining = '',
      nbLines = 0;
  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    var last  = 0;
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;
      func(line);
      nbLines++;
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
      nbLines++;
    }
    logger.debug('Blacklist loaded: %d items added.', nbLines);
  });
};

/**
 * URL blacklist.
 * @module blacklist
 */
module.exports = function() {
  // Init. with custom links:
  blacklistUrl('feeds.feedburner.com');

  // Load blacklist from file...
  var blacklistFile = files.chpath('blacklist.txt');
  files.chexists(blacklistFile)
  .then(function(exists) {
    if (!exists) return;
    logger.debug('Loading Blacklist: %s ...', blacklistFile);
    var input = fs.createReadStream(blacklistFile);
    readLines(input, blacklistUrl);
  });

  return {
    /**
     * Test if URL is blascklisted.
     * @param {String} url URL
     * @return {Boolean} true if the url is blacklisted
     */
    contains: function(url) {
      //logger.debug('Blacklist test: %s', url);
      for (var i = 0, len = blacklist.length; i < len; i++) {
        var entry = blacklist[i];
        if (url.indexOf(entry) > -1) {
          return true;
        }
      }
      return false;
    }
  };
};

