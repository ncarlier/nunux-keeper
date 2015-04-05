var when       = require('when'),
    _          = require('underscore'),
    storage    = require('../storage'),
    logger     = require('../helpers').logger,
    errors     = require('../helpers').errors,
    thumbnail  = require('../helpers').thumbnail,
    validators = require('../helpers').validators,
    Document   = require('../models').Document;

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

    Document.findById(req.params.id).lean().exec()
    .then(function(doc) {
      if (!doc) {
        return next(new errors.NotFound('Document not found.'));
      }
      if (doc.owner !== req.user.uid && !_.contains(doc.categories, 'system-public')) {
        return next(new errors.Forbidden());
      }

      var resource = _.findWhere(doc.resources, {key: req.params.key});
      if (!resource) {
        return next(new errors.NotFound('Resource not found in the document.'));
      }

      var container = storage.getContainerName(req.user.uid, 'documents', doc._id.toString(), 'resources');
      return storage.info(container, req.params.key)
      .then(function(infos) {
        if (!infos) {
          // Resource not yet available: redirect to the source
          return res.redirect(302, resource.url);
        }

        // Get thumbnail if size parameter is defined
        if (req.query && req.query.size) {
          // Get a local copy of the file (it's a noop if the driver is 'local')
          return storage.localCopy(container, req.params.key)
          .then(function(localPath) {
            return thumbnail.file(localPath, req.query.size, doc._id.toString());
          })
          .then(function(thumbPath) {
            // Remove copied file only if driver is not 'local'
            if (infos.driver !== 'local') storage.localRemove(container, req.params.key);
            res.sendfile(thumbPath, {maxAge: 86400000});
          }, next);
        } else {
          // Send the resource file content...
          res.set('Content-Length', infos.size);
          res.set('Content-Type', resource.type);
          res.set('Cache-Control', 'public, max-age=86400');
          res.set('Last-Modified', infos.mtime.toUTCString());
          return storage.stream(container, req.params.key)
          .then(function(s) {
            s.pipe(res);
          }, next);
        }
      });
    }, next);
  },

  /**
   * Fetch document's resources.
   */
  fetch: function(req, res, next) {
    if (!validators.isDocId(req.params.id)) {
      return next(new errors.BadRequest());
    }

    Document.findById(req.params.id).lean().exec()
    .then(function(doc) {
      if (!doc) {
        return next(new errors.NotFound('Document not found.'));
      }
      if (doc.owner !== req.user.uid) {
        return next(new errors.Forbidden());
      }
      return Document.downloadResources(doc);
    })
    .then(function(doc) {
      res.send(204);
    }, next);
  }
};
