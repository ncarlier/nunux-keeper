var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    nodefn         = require('when/node/function'),
    middlewares    = require('./middlewares'),
    User           = require('../models').User;

/**
 * Google auth provider configuration.
 */
module.exports = function(app, passport) {

  /**
   * Configure passport with Google strategy.
   */
  passport.use(new GoogleStrategy({
    clientID: process.env.APP_GOOGLE_KEY,
    clientSecret: process.env.APP_GOOGLE_SECRET,
    callbackURL: app.get('realm') + '/auth/google/callback',
  }, function(accessToken, refreshToken, profile, done) {
    var user = {
      uid: profile.emails[0].value,
      username: profile.displayName
    };

    var logged = User.login(user);
    nodefn.bindCallback(logged, done);
  }));

  /**
   * Google auth entry point.
   */
  app.get('/auth/google',
          middlewares.handleRedirectQueryParam,
          passport.authenticate('google', {scope: 'profile email'}));

  /**
   * Google auth return URL.
   */
  app.get('/auth/google/callback', passport.authenticate('google', {
    //successRedirect: redirect.get(req, '/'),
    failureRedirect: '/welcome?error=unauthorized'
  }), function (req, res) {
    res.redirect(req.session.redirect || '/');
    delete req.session.redirect;
  });
};
