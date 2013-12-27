var when       = require('when'),
    _          = require('underscore'),
    logger     = require('../helpers').logger,
    errors     = require('../helpers').errors,
    validators = require('../helpers').validators,
    sanitize   = require('validator').sanitize,
    Document   = require('../models').Document;

module.exports = {
  /**
   * Get a document.
   */
  get: function(req, res, next) {
    if (!validators.isDocId(req.params.id)) {
      return next(new errors.BadRequest());
    }
    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (doc) {
        if (doc.owner !== req.user.uid) {
          return when.reject(new errors.Forbidden());
        }
        return when.resolve(doc);
      } else {
        return when.reject(new errors.NotFound('Document not found.'));
      }
    })
    .then(res.json, next);
  },

  /**
   * Search documents.
   */
  search: function(req, res, next) {
    if (!req.query.q) {
      return next(new errors.BadRequest());
    }

    Document.search(req.user.uid, req.query.q)
    .then(function(data) {
      res.json(data);
    }, next);
  },


  /**
   * Post new document.
   */
  create: function(req, res, next) {
    // Sanitize and validate query params
    var title = sanitize(req.query.title).trim();
    title = sanitize(title).entityEncode();
    var url = req.query.url;
    if (url && !validators.isUrl(url)) {
      return next(new errors.BadRequest(e.message));
    }

    var doc = {
      title:       title,
      content:     req.rawBody || JSON.stringify(req.body),
      contentType: req.header('Content-Type'),
      link:        url,
      owner:       req.user.uid,
      files:       req.files
    };
    // Extract content
    Document.extract(doc)
    .then(function(_doc) {
      // Create document
      return Document.persist(_doc);
    })
    .then(function(_doc) {
      res.status(201).json(_doc);
    }, next);
  },

  /**
   * Delete one or more documents.
   */
  del: function(req, res, next) {
    var ids;

    if (req.params.id) {
      if (!validators.isDocId(req.params.id)) {
        return next(new errors.BadRequest());
      }
      ids = [req.params.id];
    } else if (req.body && _.isArray(req.body)) {
      ids = req.body;
    } else {
      return next(new errors.BadRequest());
    }

    var deleteDocument = function(id) {
      return Document.findById(id).exec()
      .then(function(doc) {
        if (!doc) return when.reject(new errors.NotFound('Document not found.'));
        if (doc.owner === req.user.uid) {
          return Document.del(doc);
        } else {
          return when.reject(new errors.Forbidden());
        }
      });
    };

    when.map(ids, deleteDocument).then(function() {
      res.send(205);
    }, next);
  }
};
