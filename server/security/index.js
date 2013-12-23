var nodefn  = require('when/node/function'),
    errors  = require('../helpers').errors,
    User    = require('../models').User,
    http    = require('http'),
    request = http.IncomingMessage.prototype;

/**
 * Test if request is done by an Admin.
 *
 * @return {Boolean}
 * @api public
 */
request.isAdmin = function() {
  return this.user && this.user.uid === process.env.APP_ADMIN;
};

/**
 * Security application configuration.
 */
module.exports = function(app, passport) {
  /**
   * Serialize user.
   */
  passport.serializeUser(function(user, done) {
    done(null, user.uid);
  });

  /**
   * Deserialize user.
   */
  passport.deserializeUser(function(uid, done) {
    var logged = User.login({uid: uid});
    nodefn.bindCallback(logged, done);
  });

  /**
   * Middleware to check that the user is logged.
   */
  app.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {return next(); }
    next(new errors.Forbidden());
  };

  /**
   * Middleware to check that the user is an admin.
   */
  app.ensureIsAdmin = function(req, res, next) {
    next(req.isAdmin() ? null : new errors.Unauthorized());
  };

  /**
   * Logout route.
   */
  app.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
  });


  // Register Google auth provider.
  require('./google')(app, passport);
  // Register BrowserId auth provider.
  require('./browserid')(app, passport);
};
