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
    var title   = 'Sample Doc',
        content = '<p>sample</p>';

    request.post({
      url: url,
      jar: true,
      qs:  {title: title},
      headers: {
        'Content-Type': 'text/html'
      },
      body: content
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body = JSON.parse(body);
      body.title.should.equal(title);
      body.owner.should.equal('foo@bar.com');
      body.content.should.equal(content);
      body.should.have.property('_id');
      body.should.have.property('date');
      docId = body._id;
      done();
    });
  });

  it('should find documents', function(done) {
    var query = 'sample';

    request.get({
      url: url,
      jar: true,
      qs:  {q: query},
      json: true
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.have.property('hits');
      body.hits.total.should.be.above(0);
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
