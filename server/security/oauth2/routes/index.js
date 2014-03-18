var api        = require('../api'),
    Client     = require('../models').Client,
    middleware = require('../../middlewares');

/**
 * Validating the client making the authorization request.
 * @param {String} clientId client ID
 * @param {String} redirectURI redirect URI to which the user will be
 * redirected after an authorization decision is obtained.
 * @param {Function} done callback with client instance and redirect URI
 */
var authorization = function(clientId, redirectURI, done) {
  Client.findById(clientId, function(err, client) {
    if (err) { return done(err); }
    // WARNING: For security purposes, it is highly advisable to check that
    //          redirectURI provided by the client matches one registered with
    //          the server.  For simplicity, this example does not.  You have
    //          been warned.
    return done(null, client, redirectURI);
  });
};

/**
 * API Routes.
 */
module.exports = function(app, server, passport) {
  /**
   * User authorization endpoint.
   *
   * Initializes a new authorization transaction.  It is the application's
   * responsibility to authenticate the user and render a dialog to obtain
   * their approval (displaying details about the client requesting
   * authorization).
   */
  app.get('/oauth/authorize',
          middleware.ensureAuthenticated,
          server.authorization(authorization),
          api.authorize(app));

  /**
   * User decision endpoint.
   *
   * `decision` middleware processes a user's decision to allow or deny access
   * requested by a client application.
   */
  app.post('/oauth/authorize/decision',
           middleware.ensureAuthenticated,
           server.decision());

  /**
   * Token endpoint.
   *
   * `token` middleware handles client requests to exchange authorization grants
   * for access tokens.
   */
  app.post('/oauth/token',
           passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
           server.token(),
           server.errorHandler());

  // Client management API:
  app.get('/api/admin/oauth/client/:id', api.client.get);
  app.get('/api/admin/oauth/client', api.client.all);
  app.post('/api/admin/oauth/client', api.client.create);
  app.put('/api/admin/oauth/client/:id', api.client.update);
  app.delete('/api/admin/oauth/client/:id', api.client.del);
};
