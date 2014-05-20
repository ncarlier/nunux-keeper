var BrowserIDStrategy = require('passport-browserid').Strategy,
    nodefn      = require('when/node/function'),
    middlewares = require('./middlewares'),
    redirect    = require('./helpers').redirect,
    User        = require('../models').User;

/**
 * Browser ID configuration.
 */
module.exports = function(app, passport) {

  /**
   * Configure passport with Browser ID strategy.
   */
  passport.use(new BrowserIDStrategy({
    audience: app.get('realm')
  }, function(email, done) {
    var user = {
      uid: email,
      username: email
    };
    var logged = User.login(user);
    nodefn.bindCallback(logged, done);
  }));

  /**
   * Borwser ID auth entry point.
   */
  app.post(
    '/auth/browserid',
    middlewares.handleRedirectQueryParam,
    passport.authenticate('browserid', {
      //successRedirect: redirect.get(req, '/'),
      failureRedirect: '/welcome?error=unauthorized'
    }),
    function (req, res) {
      res.redirect(req.session.redirect || '/');
      delete req.session.redirect;
    }
  );
};
