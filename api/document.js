var logger   = require('../helpers').logger,
    errors   = require('../helpers').errors,
    when     = require('when'),
    sanitize = require('validator').sanitize,
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
    // Sanitize and validate query params
    var title = sanitize(req.query.title).trim();
    title = sanitize(title).entityEncode();
    var url = req.query.url;
    if (url) {
      try {
        check(req.query.url).isUrl()
      } catch (e) {
        return next(new errors.BadRequest(e.message));
      }
    }

    var obj = {
      contentType: req.header('Content-Type'),
      content: req.rawBody
    };
    // Extract content
    Document.extract(obj)
    .then(function(doc) {
      doc.title = title;
      doc.owner = req.user.uid;
      doc.url   = url;

      // Create document
      return Document.create(doc);
    })
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
