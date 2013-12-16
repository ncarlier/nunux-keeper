var should     = require('should'),
    request    = require('request'),
    mockServer = require('./common/mock-server'),
    logger     = require('../helpers').logger;


describe('Check document API', function() {
  var url = mockServer.getRealm() + '/api/document';
  var docId;

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

  it('should not found fake document', function(done) {
    request.get({
      url:  url + '/50341373e894ad16347efe01',
      jar:  true,
      json: true
    }, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(404);
      done();
    });
  });

  it('should create new document', function(done) {
    var newDoc = {
      title:       'Sample Doc',
      body:        '<p>sample</p>',
      contentType: 'text/html'
    };

    request.post({
      url:  url,
      jar:  true,
      json: true,
      body: newDoc
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body.title.should.equal('Sample Doc');
      body.owner.should.equal('foo@bar.com');
      body.should.have.property('_id');
      body.should.have.property('date');
      docId = body._id;
      done();
    });
  });

  it('should delete new document', function(done) {
    request.del({
      url:  url + '/' + docId,
      jar:  true,
      json: true
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(205);
      done();
    });
  });

});
