var _          = require('underscore'),
    when       = require('when'),
    storage    = require('../storage'),
    errors     = require('../helpers').errors,
    validators = require('../helpers').validators,
    User       = require('../models').User,
    Document   = require('../models').Document;

/**
 * Public page controller.
 */
module.exports = {
  /**
   * Get public document.
   */
  getDoc: function(req, res, next) {
    if (!validators.isDocId(req.params.id)) {
      return next(new errors.NotFound('Document not found.'));
    }

    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (!doc || !_.contains(doc.categories, 'system-public')) {
        return next(new errors.NotFound('Document not found.'));
      }
      req.context.doc = doc;
      res.render('public-doc.html', req.context);
    }, next);
  },

  /**
   * Get public page of an user.
   */
  getPage: function(req, res, next) {
    var query = User.findOne().where('publicAlias').equals(req.params.alias);

    query.exec()
    .then(function(user) {
      if (!user) {
        return when.reject(new errors.NotFound('User not found.'));
      }
      req.context.user = user;
      return Document.find().where('owner').equals(user.uid)
      .where('categories').in(['system-public'])
      .limit(100)
      .sort('-date')
      .exec();
    })
    .then(function(docs) {
      req.context.docs = docs;
      res.render('public-page.html', req.context);
    }, next);
  },

  /**
   * Get public RSS of an user.
   */
  getRss: function(req, res, next) {
    var query = User.findOne().where('publicAlias').equals(req.params.alias);

    query.exec()
    .then(function(user) {
      if (!user) {
        return when.reject(new errors.NotFound('User not found.'));
      }
      req.context.user = user;
      return Document.find().where('owner').equals(user.uid)
      .where('categories').in(['system-public'])
      .limit(100)
      .sort('-date')
      .exec();
    })
    .then(function(docs) {
      req.context.docs = docs;
      res.set('Content-Type', 'application/atom+xml');
      res.render('public-rss.ejs', req.context);
    }, next);
  },

  /**
   * Get public document in its raw format.
   */
  getRawDoc: function(req, res, next) {
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

