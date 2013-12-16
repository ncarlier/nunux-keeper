var logger   = require('../helpers').logger,
    Document = require('../models').Document;

var checkForHex = new RegExp("^[0-9a-fA-F]{24}$");

module.exports = {
  /**
   * Get a document.
   */
  get: function(req, res, next) {
    if (!checkForHex.test(req.params.id)) {
      return res.send(400);
    }
    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (doc) {
        res.json(doc);
      } else {
        res.send(404);
      }
    }, next);
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
      return res.send(400);
    }

    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (doc) {
        if (doc.owner === req.user.uid) {
          Document.remove(doc).exec()
          .then(function() {
            res.send(205);
          }, next);
        }
        else {
          res.send(403);
        }
      } else {
        res.send(404);
      }
    }, next);
  }
};
