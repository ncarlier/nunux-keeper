var when     = require('when'),
    errors   = require('../helpers').errors,
    logger   = require('../helpers').logger,
    User     = require('../models').User,
    Document = require('../models').Document;

/**
 * Public page controller.
 */
module.exports = {
  /**
   * Get public page.
   */
  get: function(req, res, next) {
    var alias = req.params.alias;
    User.findOne({publicAlias: alias}).exec()
    .then(function(user) {
      if (!user) return when.reject(new errors.NotFound('Page not found.'));
      logger.debug('Show public page %s of user %s', alias, user.uid);
      var query = {
        owner: user.uid,
        categories: 'system-public'
      };
      return Document.find(query).exec();
    })
    .then(function(documents) {
      logger.debug('Show public page %s (#%d documents)', alias, documents.length);
      req.context.documents = documents;
      res.render('public', req.context);
    }, next);
  }
};

