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
      res.render('public', req.context);
    }, next);
  }
};

