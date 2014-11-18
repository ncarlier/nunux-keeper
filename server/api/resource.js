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

    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (!doc) {
        return when.reject(new errors.NotFound('Document not found.'));
      }
      if (doc.owner !== req.user.uid && !_.contains(doc.categories, 'system-public')) {
        return when.reject(new errors.Forbidden());
      }

      var resource = _.findWhere(doc.resources, {key: req.params.key});
      if (!resource) {
        return when.reject(new errors.NotFound('Resource not found in the document.'));
      }

      var container = storage.getContainerName(req.user.uid, 'documents', doc._id.toString());
      return storage.info(container, req.params.key)
      .then(function(infos) {
        if (!infos) {
          // Resource not yet available: redirect to the source
          return res.redirect(302, resource.url);
        }

        // Get thumbnail if size is define
        if (req.query.size) {
          // Get a local copy of the file (it's a noop if the driver is 'local')
          return storage.localCopy(container, req.params.key)
          .then(function(localPath) {
            return thumbnail(localPath, req.query.size)
            .then(function(thumbPath) {
              res.sendFile(thumbPath, {maxAge: '86400000'});
              // Remove copied file only if driver is not 'local'
              if (infos.driver !== 'local') storage.localRemove(container, req.params.key);
            });
          });
        } else {
          // Send the resource file content...
          logger.debug('RESOURCE: STREAM', req.params);
          res.set('Content-Length', infos.size);
          res.set('Content-Type', resource.type);
          res.set('Cache-Control', 'max-age=86400000');
          return storage.stream(container, req.params.key)
          .then(function(s) {
            s.pipe(res);
          });
        }
      });
    }, next);
  }
};
