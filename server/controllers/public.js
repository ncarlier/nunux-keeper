var _          = require('underscore'),
    storage    = require('../storage'),
    errors     = require('../helpers').errors,
    validators = require('../helpers').validators,
    Document   = require('../models').Document;

/**
 * Public page controller.
 */
module.exports = {
  /**
   * Get public document.
   */
  get: function(req, res, next) {
    if (!validators.isDocId(req.params.id)) {
      return next(new errors.NotFound('Document not found.'));
    }

    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (!doc || !_.contains(doc.categories, 'system-public')) {
        return next(new errors.NotFound('Document not found.'));
      }
      req.context.doc = doc;
      res.render('public.html', req.context);
    }, next);
  },

  /**
   * Get public document in its raw format.
   */
  getRaw: function(req, res, next) {
    if (!validators.isDocId(req.params.id)) {
      return next(new errors.NotFound('Document not found.'));
    }

    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (!doc || !_.contains(doc.categories, 'system-public')) {
        return next(new errors.NotFound('Document not found.'));
      }
      if (!doc.attachment) {
        res.writeHead(200, {
          'Content-Type': doc.contentType
        });
        res.end(doc.content);
      } else {
        var container = storage.getContainerName(req.user.uid, 'documents', doc._id.toString(), 'attachment');
        return storage.info(container, doc.attachment)
        .then(function(infos) {
          if (!infos) {
            return next(new errors.NotFound('Document attachment not found.'));
          }
          // Send the resource file content...
          res.set('Content-Length', infos.size);
          res.set('Content-Type', doc.contentType);
          res.set('Cache-Control', 'public, max-age=86400');
          res.set('Last-Modified', infos.mtime.toUTCString());
          return storage.stream(container, doc.attachment)
          .then(function(s) {
            s.pipe(res);
          });
        });
      }
    }, next);
  }

};

