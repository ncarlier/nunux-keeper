/* jshint -W030 */

var should     = require('should'),
    request    = require('request'),
    mockServer = require('./common/mock-server');

describe('Check basic document API', function() {
  var url = mockServer.getRealm() + '/api/document',
      uid = 'foo@bar.com';
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

  it('should create new TEXT document', function(done) {
    var title   = 'Sample TEXT document',
        content = 'hello world!';

    request.post({
      url: url,
      jar: true,
      qs:  {title: title},
      headers: {
        'Content-Type': 'text/plain'
      },
      body: content
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body = JSON.parse(body);
      body.should.have.properties('_id', 'date');
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      body.content.should.equal(content);
      body.contentType.should.equal('text/plain');
      docId = body._id;
      done();
    });
  });

  it('should retrieve previous TEXT document', function(done) {
    request.get({
      url:  url + '/' + docId,
      jar:  true,
      json: true
    }, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.have.properties('_id', 'date');
      body.owner.should.equal(uid);
      done();
    });
  });

  it('should NOT retrieve previous private TEXT document if not connected', function(done) {
    request.get({
      url:  url + '/' + docId,
      json: true
    }, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(403);
      done();
    });
  });

  it('should update previous TEXT document to be public', function(done) {
    var title   = 'Updated sample TEXT document',
        content = 'hello world!!!',
        categories = ['system-public'];

    request.put({
      url: url + '/' + docId,
      jar: true,
      qs:  {title: title, categories: categories},
      headers: {
        'Content-Type': 'text/plain'
      },
      body: content
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body = JSON.parse(body);
      body.should.have.property('_id');
      body.title.should.equal(title);
      body.content.should.equal(content);
      body.categories.should.have.length(1);
      body.categories.should.include('system-public');
      done();
    });
  });

  it('should retrieve previous public TEXT document if not connected', function(done) {
    request.get({
      url:  url + '/' + docId,
      json: true
    }, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.have.properties('_id', 'categories');
      body.categories.should.have.length(1);
      body.categories.should.include('system-public');
      done();
    });
  });

  it('should delete previous TEXT document', function(done) {
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
