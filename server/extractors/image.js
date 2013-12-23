var when       = require('when'),
    fs         = require('fs'),
    request    = require('request'),
    logger     = require('../helpers').logger,
    files      = require('../helpers').files,
    validators = require('validator').validators;

/**
 * Image content extractor.
 */
module.exports = {
  extract: function(doc) {
    logger.debug('Using image extractor.');
    var extracted = when.defer();
    if (doc.content && doc.content !== '') {
      if (validators.isUrl(doc.content)) {
        doc.link = doc.content;
        var inputStream = request.get(doc.link);
        files.mkdir(doc.owner, 'images')
        .then(function(dir) {
          return files.writeStream(inputStream, files.getFilePath(dir, doc.link));
        })
        .then(function() {
          extracted.resolve(doc);
        }, extracted.reject);
      } else {
        // TODO Try to decode base 64 content...
        return when.reject('Not yet implemented.');
      }
    } else if (doc.files) { // no content, test if it's a file...
      var file = doc.files[0];
      var inputStream = fs.createReadStream(file.path);
      files.mkdir(doc.owner, 'images')
      .then(function(dir) {
        return files.writeStream(inputStream, files.getFilePath(dir, doc.link));
      })
      .then(function() {
        extracted.resolve(doc);
      }, extracted.reject);
    } else {
      return when.reject('Content not found.');
    }

    return extracted.promise;
  }
};
