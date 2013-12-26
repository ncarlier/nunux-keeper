var when       = require('when'),
    nodefn     = require('when/node/function'),
    fs         = require('fs'),
    logger     = require('../helpers').logger,
    errors     = require('../helpers').errors,
    files      = require('../helpers').files,
    validators = require('../helpers').validators,
    Document   = require('../models').Document;

module.exports = {
  /**
   * Get document's resource.
   */
  get: function(req, res, next) {
    if (!validators.isDocId(req.params.id)) {
      return next(new errors.BadRequest());
    }

    var file;
    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (!doc) {
        return when.reject(new errors.NotFound('Document not found.'));
      }
      if (doc.owner !== req.user.uid) {
        return when.reject(new errors.Forbidden());
      }

      file = files.chpath(req.user.uid, 'documents', doc._id.toString(), req.params.key);
      logger.debug('Sending file: ' + file);
      res.sendfile(file, next);
    }, next);
  }
};
