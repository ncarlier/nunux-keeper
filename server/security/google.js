var GoogleStrategy = require('passport-google').Strategy,
    nodefn = require('when/node/function'),
    User = require('../models').User;

/**
 * Google auth provider configuration.
 */
module.exports = function(app, passport) {

  /**
   * Configure passport with Google strategy.
   */
  passport.use(new GoogleStrategy({
    returnURL: app.get('realm') + '/auth/google/return',
    realm: app.get('realm') + '/'
  }, function(identifier, profile, done) {
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
  app.get('/auth/google', passport.authenticate('google'));

  /**
   * Google auth return URL.
   */
  app.get('/auth/google/return', passport.authenticate('google', {
    successRedirect: '/', failureRedirect: '/welcome?error=unauthorized'
  }));
};
