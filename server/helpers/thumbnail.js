var when       = require('when'),
    _          = require('underscore'),
    gm         = require('gm'),
    logger     = require('../helpers').logger,
    files      = require('../helpers').files;

var imageExtensions = ['png', 'jpg', 'jpeg', 'gif'],
		sizes = ['200x150'];

/**
 * Get image thumbnail.
 * @param {File} file
 * @param {String} size
 * @return {Promise} promise of the thumbnail
 */
var getThumbnail = function(file, size) {
  var ext = file.split('.').pop();
  if (ext) {
    ext = ext.toLowerCase();
  }
  if (!_.contains(imageExtensions, ext)) {
    return when.reject('Input file is not a supported image format.');
  }
  if (!_.contains(sizes, size)) {
    return when.reject('Resizing size is not available.');
  }

  var filename = file.split('/').pop(),
      thumbfile = null;

  return files.chmkdir('tmp', 'thumb')
  .then(function(dir) {
    thumbfile = files.chpath(dir, filename);
    return files.chexists(thumbfile);
  })
  .then(function (exists) {
    if (exists) return when.resolve(thumbfile);
    logger.debug('Resizing image %s to %s', file, thumbfile);

    var thumbnailed = when.defer();

    var resize = size.split('x');

    gm(file)
    .options({imageMagick: true})
    .resize(resize[0], resize[1], '^')
    .quality(75)
    .gravity('Center')
    .extent(size)
    .write(thumbfile, function (err) {
      if (err) {
        logger.error('Unable to resize image %s', file, err);
        return thumbnailed.reject(err);
      }
      logger.debug('Image %s resized.', file);
      return thumbnailed.resolve(thumbfile);
    });

    return thumbnailed.promise;
  });
};

/**
 * Thumbnail an image.
 * @module thumbnail
 */
module.exports = getThumbnail;
