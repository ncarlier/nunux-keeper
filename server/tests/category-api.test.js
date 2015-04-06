var should     = require('should'),
    request    = require('request'),
    mockServer = require('./common/mock-server'),
    logger     = require('../helpers').logger;


describe('Check category API', function() {
  var url = mockServer.getRealm() + '/api/category',
      uid = 'foo@bar.com',
      key = 'user-sample-category',
      label = 'Sample  Category :) ';

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

  it('should create new category', function(done) {
    request.post({
      url: url,
      jar: true,
      json: true,
      body: {label: label}
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body.should.have.property('key');
      body.label.should.equal(label.trim());
      body.color.should.equal('#fff');
      body.key.should.equal(key);
      body.owner.should.equal(uid);
      done();
    });
  });

  it('should find previous created category', function(done) {
    request.get({
      url: url + '/' + key,
      jar: true,
      json: true
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.have.property('key');
      body.key.should.equal(key);
      body.owner.should.equal(uid);
      done();
    });
  });

  it('should update previous created category', function(done) {
    var update = {
      label: 'updated category',
      color: '#f0f'
    };
    request.put({
      url: url + '/' + key,
      jar: true,
      json: true,
      body: update
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.have.property('key');
      body.key.should.equal(key);
      body.label.should.equal(update.label);
      body.color.should.equal(update.color);
      done();
    });
  });


  it('should find all categories', function(done) {
    request.get({
      url: url,
      jar: true,
      json: true
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.be.an.instanceOf(Array);
      body.length.should.be.above(2);
      body[0].should.have.property('key');
      body[0].key.should.equal('system-trash');
      done();
    });
  });

  it('should delete previous created category', function(done) {
    request.del({
      url:  url + '/' + key,
      jar:  true,
      json: true
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(205);
      done();
    });
  });

  it('should not found previous deleted category', function(done) {
    request.get({
      url:  url + '/' + key,
      jar:  true,
      json: true
    }, function (err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(404);
      done();
    });
  });

});

