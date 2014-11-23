var when       = require('when'),
    _          = require('underscore'),
    storage    = require('../storage'),
    logger     = require('../helpers').logger,
    errors     = require('../helpers').errors,
    thumbnail  = require('../helpers').thumbnail,
    validators = require('../helpers').validators,
    Document   = require('../models').Document;

/**
 * API to get document attachment.
 * @module resource
 */
module.exports = {
  /**
   * Get document's attachment.
   */
  get: function(req, res, next) {
    console.log('ATTACMENT - ATTACHMENT - ATTACHMENT');
    if (!validators.isDocId(req.params.id)) {
      return next(new errors.BadRequest());
    }

    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (!doc) {
        return next(new errors.NotFound('Document not found.'));
      }
      if (doc.owner !== req.user.uid && !_.contains(doc.categories, 'system-public')) {
        return next(new errors.Forbidden());
      }

      if (doc.attachment === null) {
        return next(new errors.NotFound('Document has no attachment.'));
      }

      var container = storage.getContainerName(req.user.uid, 'documents', doc._id.toString(), 'attachment');
      return storage.info(container, doc.attachment)
      .then(function(infos) {
        if (!infos) {
          return next(new errors.NotFound('Document attachment not found.'));
        }

        // If conten-type is an image and the parameter size is defined, then get the thumbnail
        if (req.query.size && /^image\//.test(doc.contentType)) {
          // Get a local copy of the file (it's a noop if the driver is 'local')
          return storage.localCopy(container, doc.attachment)
          .then(function(localPath) {
            return thumbnail(localPath, req.query.size, doc._id.toString());
          })
          .then(function(thumbPath) {
            // Remove copied file only if driver is not 'local'
            if (infos.driver !== 'local') storage.localRemove(container, doc.attachment);
            res.sendfile(thumbPath, {maxAge: 86400000});
          });
        } else {
          // Send the resource file content...
          res.set('Content-Length', infos.size);
          res.set('Content-Type', doc.contentType);
          res.set('Cache-Control', 'public, max-age=86400');
          res.set('Last-Modified', infos.mtime.toUTCString());
          return storage.stream(container, doc.attachment)
          .then(function(s) {
            s.pipe(res);
          });
        }
      });
    }, next);
  }
};
