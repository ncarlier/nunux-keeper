var when       = require('when'),
    _          = require('underscore'),
    logger     = require('../helpers').logger,
    errors     = require('../helpers').errors,
    validators = require('../helpers').validators,
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
        // Only allow to see public or own document.
        var isPublic = _.contains(doc.categories, 'system-public');
        if (!isPublic && (!req.isAuthenticated() || doc.owner !== req.user.uid)) {
          return next(new errors.Forbidden());
        }
        return res.json(doc);
      } else {
        return next(new errors.NotFound('Document not found.'));
      }
    }, next);
  },

  /**
   * Search documents.
   */
  search: function(req, res, next) {
    Document.search(req.user.uid, req.query)
    .then(function(data) {
      res.json(data);
    }, next);
  },

  /**
   * Post new document.
   */
  create: function(req, res, next) {
    // Sanitize and validate query params
    var link = req.query.link;
    if (link && !validators.isURL(link)) {
      return next(new errors.BadRequest('Url link invalid.'));
    }
    var categories = req.query.categories ? req.query.categories : [];

    var doc = {
      title:       req.query.title,
      content:     req.text || JSON.stringify(req.body),
      contentType: req.header('Content-Type'),
      link:        link,
      owner:       req.user.uid,
      categories:  categories,
      files:       req.files
    };

    // Extract content
    Document.extract(doc)
    .then(function(_doc) {
      // Create document(s)
      if (_.isArray(_doc)) {
        return when.map(_doc, function(item) {
          return Document.persist(item);
        });
      } else {
        return Document.persist(_doc);
      }
    })
    .then(function(_doc) {
      if (_.isArray(_doc) && _doc.length === 1) {
        _doc = _doc[0];
      }
      res.status(201).json(_doc);
    }, next);
  },

  /**
   * Update document.
   * Can only update:
   * - title
   * - content (only if text content type)
   * - categories
   */
  update: function(req, res, next) {
    if (!validators.isDocId(req.params.id)) {
      return next(new errors.BadRequest());
    }

    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (!doc) return when.reject(new errors.NotFound('Document not found.'));
      // Check owner
      if (doc.owner !== req.user.uid) {
        return when.reject(new errors.Forbidden());
      }

      // Update DTO
      var update = {};
      // Update title
      if (req.query.title) {
        update.title = req.query.title;
      }
      // Update categories
      if (req.query.categories) {
        update.categories = req.query.categories;
      }

      // Check that content can be modified
      if (req.text) {
        var contentType = req.header('Content-Type');
        if (doc.contentType.toLowerCase() !== contentType.toLowerCase()) {
          return when.reject(new errors.BadRequest('Change document content type is not supported ('+ doc.contentType  +' -> '+ contentType +').'));
        }
        if (!/^text/g.test(contentType)) {
          return when.reject(new errors.BadRequest('Only text content type modification is supported: ' + contentType));
        }
        // Extract content
        doc.content = req.text;
        return Document.extract(doc).then(function(_doc) {
          // Udpate content
          update.content = _doc.content;
          update.resources = _doc.resources;
          if (update.resources.length) {
            update.illustration = update.resources[0].url;
          }

          return Document.modify(doc, update);
        });
      }
      // Update document
      return Document.modify(doc, update);
    })
    .then(function(doc) {
      res.status(200).json(doc);
    }, next);
  },

  /**
   * Delete one or more documents.
   */
  del: function(req, res, next) {
    var ids = null;

    if (req.params.id) {
      if (!validators.isDocId(req.params.id)) {
        return next(new errors.BadRequest());
      }
      ids = [req.params.id];
    } else if (req.body && _.isArray(req.body)) {
      ids = req.body;
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

    if (ids) {
      // Delete defined ids
      when.map(ids, deleteDocument).then(function() {
        res.send(205);
      }, next);
    } else {
      logger.info('Emptying trash bin of %s ...', req.user.uid);
      // Empty trash bin category
      Document.find({ owner: req.user.uid, categories: 'system-trash' }).exec()
      .then(function(docs) {
        return when.map(docs, function(doc) {
          return Document.del(doc);
        });
      })
      .then(function() {
        res.send(205);
      }, next);
    }
  }
};
