var errors = require('../../helpers').errors;

/**
 * Security Middlewares.
 * @module middlewares
 */
module.exports = {
  /**
   * Middleware to check that the user is logged via token.
   */
  token: function(passport) {
    return function(req, res, next) {
      // Bypass if already authenticated
      if (req.isAuthenticated()) { return next(); }
      passport.authenticate('bearer', function(err, user, info) {
        if (err) { return next(err); }
        next();
      })(req, res, next);
    };
  },
  /**
   * Middleware to check that the user is logged.
   */
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    next(new errors.Forbidden());
  },
  /**
   * Middleware to check that the user is an admin.
   */
  ensureIsAdmin: function(req, res, next) {
    next(req.isAdmin() ? null : new errors.Unauthorized());
  },
  /**
   * Middleware to handle redirect query param.
   */
  handleRedirectQueryParam: function(req, res, next) {
    if (req.query.redirect) {
      req.session.redirect = req.query.redirect;
    }
    next();
  }
};
