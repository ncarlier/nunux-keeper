var when       = require('when'),
    fs         = require('fs'),
    request    = require('request'),
    logger     = require('../helpers').logger,
    files      = require('../helpers').files,
    validators = require('validator').validators;

/**
 * Save a document attachment to the owner tmp directory.
 * @param {Document} document
 * @param {Steam} inputStream
 * @param {name} name - Name of the attachment
 * @returns {Promise} Promise of the doc with his attachment.
 */
var saveAttachment = function(doc, inputStream, name) {
  return files.mkdir(doc.owner, 'tmp')
  .then(function(dir) {
    return files.writeStream(inputStream, files.getFilePath(dir, name));
  })
  .then(function(file) {
    doc.attachment = file;
    return when.resolve(doc);
  }, when.reject);
};

/**
 * Image content extractor.
 * @module image
 */
module.exports = {
  /**
   * Extract image content of a document.
   * Image can be referer as a link or can be attached as a file.
   * Image is store in a temp location (@see doc.attachment)
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted image.
   */
  extract: function(doc) {
    logger.debug('Using image extractor.');

    if (doc.content && doc.content !== '') {
      if (validators.isUrl(doc.content)) {
        doc.link = doc.content;
        var inputStream = request.get(doc.link);
        return saveAttachment(doc, inputStream, doc.link);
      } else {
        // TODO Try to decode base 64 content...
        return when.reject('Other content that URL are not yet implemented.');
      }
    } else if (doc.files) { // no content, test if it's a file...
      var file = doc.files[0];
      var inputStream = fs.createReadStream(file.path);
      return saveAttachment(doc, inputStream, doc.link);
    } else {
      return when.reject('Content not found.');
    }
  }
};
