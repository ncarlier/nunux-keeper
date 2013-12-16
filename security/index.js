var nodefn = require('when/node/function'),
    User = require('../models').User;

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
    if (req.isAuthenticated()) { return next(); }
    res.send(401);
  };

  /**
   * Middleware to check that the user is an admin.
   */
  app.ensureIsAdmin = function(req, res, next) {
    if (req.user.uid == process.env.APP_ADMIN) { return next(); }
    res.send(403);
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
