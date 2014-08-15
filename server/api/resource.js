var when       = require('when'),
    nodefn     = require('when/node/function'),
    _          = require('underscore'),
    gm         = require('gm'),
    logger     = require('../helpers').logger,
    errors     = require('../helpers').errors,
    files      = require('../helpers').files,
    validators = require('../helpers').validators,
    Document   = require('../models').Document;

var oneDay = 86400000,
    imageExtensions = ['png', 'jpg', 'jpeg', 'gif'],
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
    return when.reject(new errors.BadRequest('Requested resource is not an image.'));
  }
  if (!_.contains(sizes, size)) {
    return when.reject(new errors.BadRequest('Requested size is not available.'));
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
 * API to get document resource.
 * @module resource
 */
module.exports = {
  /**
   * Get document's resource.
   */
  get: function(req, res, next) {
    if (!validators.isDocId(req.params.id)) {
      return next(new errors.BadRequest());
    }

    var file;
    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (!doc) {
        return when.reject(new errors.NotFound('Document not found.'));
      }
      if (doc.owner !== req.user.uid) {
        return when.reject(new errors.Forbidden());
      }

      file = files.chpath(req.user.uid, 'documents', doc._id.toString(), req.params.key);
      return files.chexists(file)
      .then(function(exists) {
        if (!exists) {
          // TODO return 404 image instead
          return when.reject(new errors.NotFound('Resource not found.'));
        }
        if (req.query.size) {
          return getThumbnail(file, req.query.size);
        }
        return when.resolve(file);
      });
    })
    .then(function(file) {
      res.sendfile(file, {maxAge: oneDay});
    }, next);
  }
};
