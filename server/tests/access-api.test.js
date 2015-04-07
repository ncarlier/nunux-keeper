var should     = require('should'),
    request    = require('request'),
    mockServer = require('./common/mock-server'),
    logger     = require('../helpers').logger;


describe('Check API access:', function() {
  before(mockServer.start);

  after(mockServer.stop);

  it('should be redirect to the welcome page if not logged', function(done) {
    var url = mockServer.getRealm() + '/';
    request.get(url, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      res.req.path.should.equal('/welcome');
      done();
    });
  });

  it('should access to API infos if not logged', function(done) {
    var url = mockServer.getRealm() + '/api';
    request.get({url: url, json: true}, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.name.should.equal('keeper');
      done();
    });
  });

  it('should NOT access to user API if not logged', function(done) {
    var url = mockServer.getRealm() + '/api/user/current';
    request.get({url: url, json: true}, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(403);
      done();
    });
  });

  it('should be redirect to the home page if logged', function(done) {
    var url = mockServer.getRealm() + '/auth/mock';
    request.get({url: url, jar: true}, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      res.req.path.should.equal('/');
      done();
    });
  });

  it('should access to user API if logged', function(done) {
    var url = mockServer.getRealm() + '/api/user/current';
    request.get({url: url, jar: true, json: true}, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.have.property('uid');
      body.uid.should.equal('foo@bar.com');
      done();
    });
  });

});

