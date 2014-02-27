var should     = require('should'),
    request    = require('request'),
    mockServer = require('./common/mock-server'),
    logger     = require('../helpers').logger;


describe('Check user API', function() {
  var uid = 'foo@bar.com',
      url = mockServer.getRealm() + '/api/user';

  before(function(done) {
    mockServer.start(function() {
      request.get({
        url: mockServer.getRealm() + '/auth/mock',
        jar: true,
        json: true
      }, done);
    });
  });

  after(mockServer.stop);

  it('should update user configuration', function(done) {
    request.put({
      url: url + '/' + uid,
      jar: true,
      json: true,
      body: {publicAlias: 'test'}
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.have.property('uid');
      body.publicAlias.should.equal('test');
      done();
    });
  });
});

