var MockStrategy = require('./strategy/MockStrategy'),
    nodefn = require('when/node/function'),
    User = require('../models').User;

/**
 * Mock auth provider configuration.
 */
module.exports = function(app, passport, options) {

  /**
   * Configure passport with Mock strategy.
   */
  passport.use(new MockStrategy(
    options,
    function(user, done) {
      done(null, user);
    }
  ));

  /**
   * Mock auth entry point.
   */
  app.get('/auth/mock', passport.authenticate('mock', {
    successRedirect: '/', failureRedirect: '/welcome?error=unauthorized'
  }));
};
