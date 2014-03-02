var logger = require('../helpers').logger,
    User   = require('../models').User;

/**
 * Middleware to handle API token auth.
 */
module.exports = function() {
  return function(req, res, next) {
    var token = req.header('X-Auth-Token');
    if (!token) return next();
    User.findOne({apiToken: token}).exec()
    .then(function(user) {
      logger.info('API access for: %s', user.uid);
      req.user = user;
      next();
    }, function(err) {
      logger.error('Bad API token: %s', token);
      next();
    });
  };
};
