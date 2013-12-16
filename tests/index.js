var should     = require('should'),
    request    = require('request'),
    mockServer = require('./common/mock-server'),
    logger     = require('../helpers').logger;


describe('Check API access', function() {
  before(mockServer.start);

  after(mockServer.stop);

  it('should be redirect if not logged', function(done) {
    var url = mockServer.getRealm() + '/';
    request.get(url, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      res.req.path.should.equal('/welcome');
      done();
    });
  });

  it('should be logged', function(done) {
    var url = mockServer.getRealm() + '/auth/mock';
    request.get({url: url, jar: true, json: true}, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      res.req.path.should.equal('/');
      body.info.name.should.equal('keeper');
      body.user.uid.should.equal('foo@bar.com');
      done();
    });
  });

});

