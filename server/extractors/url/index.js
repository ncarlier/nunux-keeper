var when       = require('when'),
    url        = require('url'),
    path       = require('path'),
    zlib       = require('zlib'),
    logger     = require('../../helpers').logger,
    errors     = require('../../helpers').errors,
    validators = require('../../helpers').validators,
    request    = require('request');

var kRequest = request.defaults({
  headers: {
    'User-Agent': process.env.APP_USER_AGENT || 'Mozilla/5.0 (compatible; Keeperbot/1.0)',
    'Accept-Encoding': 'gzip'
  }
});

// Load json extractors
var urlExtractors = {};
require('fs').readdirSync(__dirname).forEach(function (file) {
  if (file === 'index.js') return;
  var name = path.basename(file, '.js');
  urlExtractors[name] = require(path.join(__dirname, file));
  logger.debug('%s URL extractor registered.', name.toUpperCase());
});

/**
 * URL content extractor.
 * @module url
 */
module.exports = {
  /**
   * Test if the extractor support the provided content-type.
   * @param {String} ct the conten-type
   * @return {Boolean} support status
   */
  support: function(ct) {
    return /^text\/uri/.test(ct);
  },
  /**
   * Extract online content of a document.
   * Redirect to proper extractor regarding content-type.
   * If content-type is not supported, document is return as is.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using URL extractor.');
    if (!validators.isURL(doc.content)) {
      return when.reject(new errors.BadRequest('URL not valid: ' + doc.content));
    }
    doc.link = doc.content;

    var extractor = null;
    for (var ext in urlExtractors) {
      if (urlExtractors[ext].detect(doc)) {
        extractor = urlExtractors[ext];
        break;
      }
    }
    if (extractor) {
      return extractor.extract(doc);
    } else {
      var extracted = when.defer();
      kRequest.head(doc.link, function (err, res) {
        if (err) return extracted.reject(err);
        var filename = url.parse(doc.link).pathname;
        filename = filename.substring(filename.lastIndexOf('/') + 1);
        doc.contentType = res.headers['content-type'];
        var encoding = res.headers['content-encoding'];
        doc.attachment = {
          name: filename,
          contentType: res.headers['content-type'],
          contentLength: res.headers['content-length']
        };
        if (encoding == 'gzip') {
          doc.attachment.stream = kRequest.get(doc.link).pipe(zlib.createGunzip());
        } else if (encoding == 'deflate') {
          doc.attachment.stream = kRequest.get(doc.link).pipe(zlib.createInflate());
        } else {
          doc.attachment.stream = kRequest.get(doc.link);
        }
        // Get HTTP content...
        module.parent.exports.get(doc.contentType).extract(doc)
        .then(extracted.resolve, extracted.reject);
      });

      return extracted.promise;
    }
  }
};
