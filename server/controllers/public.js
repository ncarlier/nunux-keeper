var _          = require('underscore'),
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
      res.writeHead(200, {
        'Content-Type': doc.contentType
      });
      res.end(doc.content);
    }, next);
  }

};

