var defaultExtractor = require('./default'),
    htmlExtractor    = require('./html'),
    urlExtractor     = require('./url');
    imageExtractor   = require('./image');

var getExtractor = function(ct) {
  switch (true) {
    case /^text\/html/.test(ct):
      return htmlExtractor;
    case /^text\/vnd-curl/.test(ct):
      return urlExtractor;
    case /^image\//.test(ct):
      return imageExtractor;
    default:
      return defaultExtractor;
  }
}

module.exports = {
  get: getExtractor,
  support: function(contentType) {
    return getExtractor(contentType) ? true : false;
  }
};
