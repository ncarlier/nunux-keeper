var app = require('../../app'),
    http = require('http'),
    passport = require('passport');


require('../../security/mock')(app, passport, {
  passAuthentication: true,
  uid: 'foo@bar.com'
});

var mockServer = http.createServer(app);

mockServer.start = function(done) {
  mockServer.listen(app.get('port'), done);
}

mockServer.stop = function(done) {
  mockServer.close(done);
}

mockServer.getRealm = function() {
  return app.get('realm');
}

module.exports = mockServer;

