var _          = require('underscore'),
    should     = require('should'),
    fs         = require('fs'),
    path       = require('path'),
    request    = require('request'),
    mockServer = require('./common/mock-server'),
    logger     = require('../helpers').logger,
    files      = require('../helpers').files;


describe('Check document API', function() {
  var url = mockServer.getRealm() + '/api/document',
      uid = 'foo@bar.com';
  var docId, hits;

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

  it('should create new document (HTML body)', function(done) {
    var title   = 'Sample simple HTML document',
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
      body.should.have.property('_id');
      body.should.have.property('date');
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      body.content.should.equal(content);
      body.contentType.should.equal('text/html');
      docId = body._id;
      done();
    });
  });

  it('should create new document (HTML file)', function(done) {
    var title = 'Sample uploaded HTML document',
        file  = path.join(__dirname, 'assets', 'gpl.html')

    fs.createReadStream(file).pipe(request.post({
      url: url,
      jar: true,
      qs:  {title: title}
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      //console.log(body);
      body = JSON.parse(body);
      body.should.have.property('_id');
      body.should.have.property('date');
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      body.contentType.should.match(/^text\/html/);
      done();
    }));
  });

  it('should create a new document (HTML URL)', function(done) {
    var title   = 'Sample online HTML document',
        content = 'http://reader.nunux.org';

    request.post({
      url: url,
      jar: true,
      qs:  {title: title},
      headers: {
        'Content-Type': 'text/vnd-curl'
      },
      body: content
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body = JSON.parse(body);
      body.should.have.property('_id');
      body.should.have.property('date');
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      body.contentType.should.match(/^text\/html/);
      done();
    });
  });

  it('should create a new document (Image URL)', function(done) {
    var title   = 'Sample online image document',
        content = 'http://reader.nunux.org/images/screenshots.png';

    request.post({
      url: url,
      jar: true,
      qs:  {title: title},
      headers: {
        'Content-Type': 'text/vnd-curl'
      },
      body: content
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body = JSON.parse(body);
      body.should.have.property('_id');
      body.should.have.property('date');
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      var file = files.getFilePath(files.getUserPath(uid, 'documents', body._id), content);
      fs.existsSync(file).should.be.true;
      body.contentType.should.equal('image/png');
      done();
    });
  });

  it('should find documents', function(done) {
    request.get({
      url: url,
      jar: true,
      qs:  {q: uid},
      json: true
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body.should.have.property('hits');
      body.hits.total.should.be.above(0);
      hits = body.hits.hits;
      done();
    });
  });

  it('should delete previous created document (HTML body)', function(done) {
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

  it('should delete multiple documents', function(done) {
    var ids = _.pluck(hits, '_id');
    ids = _.without(ids, docId);
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
