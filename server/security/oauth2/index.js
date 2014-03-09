var oauth2orize    = require('oauth2orize'),
    middleware     = require('../middlewares'),
    uid            = require('../helpers').uid,
    User           = require('./models').User,
    Client         = require('./models').Client,
    AccessToken    = require('./models').AccessToken,
    RefreshToken   = require('./models').RefreshToken,
    AuthorizationCode = require('./models').AuthorizationCode,
    BasicStrategy  = require('passport-http').BasicStrategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.
server.serializeClient(function(client, done) {
  return done(null, client.id);
});

server.deserializeClient(function(id, done) {
  Client.findOne({id: id}, function(err, client) {
    if (err) { return done(err); }
    return done(null, client);
  });
});


// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectURI` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.
server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  var code = uid(16);
  AuthorizationCode.create({
    code: code,
    clientId: client.id,
    redirectURI: redirectURI,
    userId: user.uid
  }, function(err) {
    if (err) { return done(err); }
    done(null, code);
  });
}));


// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.
server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  AuthorizationCode.findOne({code: code}, function(err, authzCode) {
    if (err) { return done(err); }
    if (authzCode === undefined ||
        client.id !== authzCode.clientID ||
        redirectURI !== authzCode.redirectURI) {
      return done(null, false);
    }
    AuthorizationCode.remove(authzCode, function(err) {
      if (err) { return done(err); }
      var token = uid(256);
      AccessToken.create({
        userId: authzCode.userId,
        clientId: authzCode.clientId,
        token: token
      }, function(err) {
        if (err) { return done(err); }
        done(null, token);
      });
    });
  });
}));


/**
 * OAuth2 application configuration.
 */
module.exports = function(app, passport) {

  /**
   * BasicStrategy & ClientPasswordStrategy
   *
   * These strategies are used to authenticate registered OAuth clients.  They are
   * employed to protect the `token` endpoint, which consumers use to obtain
   * access tokens.  The OAuth 2.0 specification suggests that clients use the
   * HTTP Basic scheme to authenticate.  Use of the client password strategy
   * allows clients to send the same credentials in the request body (as opposed
   * to the `Authorization` header).  While this approach is not recommended by
   * the specification, in practice it is quite common.
   */
  passport.use(new BasicStrategy(function(username, password, done) {
    Client.findOne({id: username}, function(err, client) {
      if (err) { return done(err); }
      if (!client) { return done(null, false); }
      if (client.secret != password) { return done(null, false); }
      return done(null, client);
    });
  }));

  passport.use(new ClientPasswordStrategy(function(clientId, clientSecret, done) {
    Client.findOne({id: clientId}, function(err, client) {
      if (err) { return done(err); }
      if (!client) { return done(null, false); }
      if (client.secret != clientSecret) { return done(null, false); }
      return done(null, client);
    });
  }));

  /**
   * BearerStrategy
   *
   * This strategy is used to authenticate users based on an access token (aka a
   * bearer token).  The user must have previously authorized a client
   * application, which is issued an access token to make requests on behalf of
   * the authorizing user.
   */
  passport.use(new BearerStrategy(function(accessToken, done) {
    AccessToken.findOne({token: accessToken}, function(err, token) {
      if (err) { return done(err); }
      if (!token) { return done(null, false); }

      User.findOne({uid: token.userId}, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        // to keep this example simple, restricted scopes are not implemented,
        // and this is just for illustrative purposes
        var info = { scope: '*' }
        done(null, user, info);
      });
    });
  }));

  // user authorization endpoint
  //
  // `authorization` middleware accepts a `validate` callback which is
  // responsible for validating the client making the authorization request.  In
  // doing so, is recommended that the `redirectURI` be checked against a
  // registered value, although security requirements may vary accross
  // implementations.  Once validated, the `done` callback must be invoked with
  // a `client` instance, as well as the `redirectURI` to which the user will be
  // redirected after an authorization decision is obtained.
  //
  // This middleware simply initializes a new authorization transaction.  It is
  // the application's responsibility to authenticate the user and render a dialog
  // to obtain their approval (displaying details about the client requesting
  // authorization).  We accomplish that here by routing through `ensureLoggedIn()`
  // first, and rendering the `dialog` view. 
  app.get('/oauth/authorize',
          middleware.ensureAuthenticated,
          server.authorization(function(clientId, redirectURI, done) {
            Client.findOne({clientId: clientId}, function(err, client) {
              if (err) { return done(err); }
              // WARNING: For security purposes, it is highly advisable to check that
              //          redirectURI provided by the client matches one registered with
              //          the server.  For simplicity, this example does not.  You have
              //          been warned.
              return done(null, client, redirectURI);
            });
          }),
          function(req, res) {
            var context = {
              info: app.get('info'),
              realm: app.get('realm'),
              env: app.get('env'),
              user: req.user,
              transactionID: req.oauth2.transactionID,
              client: req.oauth2.client
            };
            res.render('oauth', context);
          }
  );

  // user decision endpoint
  //
  // `decision` middleware processes a user's decision to allow or deny access
  // requested by a client application.  Based on the grant type requested by the
  // client, the above grant middleware configured above will be invoked to send
  // a response.
  app.post('/oauth/authorize/decision', middleware.ensureAuthenticated, server.decision());

  // token endpoint
  //
  // `token` middleware handles client requests to exchange authorization grants
  // for access tokens.  Based on the grant type being exchanged, the above
  // exchange middleware will be invoked to handle the request.  Clients must
  // authenticate when making requests to this endpoint.
  app.post('/oauth/token',
           passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
           server.token(),
           server.errorHandler()
          );
};

