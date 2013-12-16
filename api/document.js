var logger   = require('../helpers').logger,
    errors   = require('../helpers').errors,
    when     = require('when'),
    Document = require('../models').Document;

var checkForHex = new RegExp("^[0-9a-fA-F]{24}$");

module.exports = {
  /**
   * Get a document.
   */
  get: function(req, res, next) {
    if (!checkForHex.test(req.params.id)) {
      return next(new errors.BadRequest());
    }
    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (doc) {
        return when.resolve(doc);
      } else {
        return when.reject(new errors.NotFound('Document not found.'));
      }
    })
    .then(res.json, next);
  },

  /**
   * Post new document.
   */
  create: function(req, res, next) {
    req.body.owner = req.user.uid;
    Document.create(req.body)
    .then(function(doc) {
      res.status(201).json(doc);
    }, next);
  },

  /**
   * Delete a document.
   */
  del: function(req, res, next) {
    if (!checkForHex.test(req.params.id)) {
      return next(new errors.BadRequest());
    }

    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (!doc) return when.reject(new errors.NotFound('Document not found.'));
      if (doc.owner === req.user.uid) {
        return Document.remove(doc).exec();
      } else {
        return when.reject(new errors.Forbidden());
      }
    })
    .then(function() {
      res.send(205);
    }, next);
  }
};
