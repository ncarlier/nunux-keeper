/* jshint -W030 */

var _          = require('underscore'),
    should     = require('should'),
    request    = require('request'),
    mockServer = require('./common/mock-server');


describe('Check search API', function() {
  var url = mockServer.getRealm() + '/api/document',
      uid = 'foo@bar.com';
  var hits;

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

  it('should find documents of an category', function(done) {
    request.get({
      url: url,
      jar: true,
      qs:  {q: 'category:system-public'},
      json: true
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.have.properties('total', 'hits');
      body.total.should.be.above(0);
      done();
    });
  });

  if (process.env.APP_SEARCH_ENGINE === 'disabled') {
    it('full text search should not be available', function(done) {
      request.get({
        url: url,
        jar: true,
        qs:  {q: 'Sample'},
        json: true
      }, function(err, res, body) {
        if (err) return done(err);
        res.statusCode.should.equal(400);
        done();
      });
    });
  }

  if (process.env.APP_SEARCH_ENGINE !== 'disabled') {
    it('full text search should find documents', function(done) {
      request.get({
        url: url,
        jar: true,
        qs:  {q: 'Sample'},
        json: true
      }, function(err, res, body) {
        if (err) return done(err);
        res.statusCode.should.equal(200);
        body.should.have.properties('total', 'hits');
        body.total.should.be.above(0);
        done();
      });
    });
  }

  it('should find all documents', function(done) {
    request.get({
      url: url,
      jar: true,
      qs:  {size: 100},
      json: true
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.have.properties('total', 'hits');
      body.total.should.be.above(0);
      hits = body.hits;
      done();
    });
  });

  it('should delete multiple documents', function(done) {
    var ids = _.pluck(hits, '_id');
    request.del({
      url:  url,
      jar:  true,
      json: true,
      body: ids
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(205);
      done();
    });
  });
});
