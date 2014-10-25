/* jshint -W030 */

var _          = require('underscore'),
    should     = require('should'),
    fs         = require('fs'),
    path       = require('path'),
    request    = require('request'),
    mockServer = require('./common/mock-server'),
    logger     = require('../helpers').logger,
    hash       = require('../helpers').hash,
    files      = require('../helpers').files;


describe('Check document API', function() {
  var url = mockServer.getRealm() + '/api/document',
      imageUrl = 'http://reader.nunux.org/icons/favicon.png?foo=bar',
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

  it('should create new document (JSON body)', function(done) {
    var title   = 'Sample JSON document',
        content = {test: true};

    request.post({
      url: url,
      jar: true,
      qs:  {title: title},
      json: true,
      body: content
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body.should.have.properties('_id', 'date');
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      var c = JSON.parse(body.content);
      c.test.should.be.true;
      body.contentType.should.equal('application/json');
      done();
    });
  });

  it('should create new documents (JSON uploaded file)', function(done) {
    this.timeout(5000);
    var title = '-- Not used here --',
        file  = path.join(__dirname, 'assets', 'import.json');

    var r = request.post({
      url: url,
      jar: true,
      qs:  {title: title}
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      //console.log(body);
      body = JSON.parse(body);
      body.should.have.length(2);
      body[0].should.have.property('_id');
      body[0].should.have.property('date');
      body[0].title.should.equal('Sample Google Reader item');
      body[0].owner.should.equal(uid);
      body[0].contentType.should.match(/^text\/html/);
      done();
    });
    var form = r.form();
    form.append('my_file', fs.createReadStream(file));
  });

  it('should create new document (HTML body)', function(done) {
    var title   = 'Sample simple HTML document',
        content = '<p id="toclean">sample</P><img src="' + imageUrl + '"/>' +
          '<img class="bad" src = "http://feeds.feedburner.com/~r/azerty" />' +
          '<img class="bad" src = "http://doubleclick.net/azerty" />' +
          '<img class="test" app-src="test" src = "test" alt="test" />',
        expectedContent = '<p>sample</p><img app-src="' + imageUrl + '" />' +
          '<img app-src="test" alt="test" />',
        categories = ['system-public', 'user-test', 'bad'];

    request.post({
      url: url,
      jar: true,
      qs:  {title: title, categories: categories},
      headers: {
        'Content-Type': 'text/html'
      },
      body: content
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body = JSON.parse(body);
      body.should.have.properties('_id', 'date');
      docId = body._id;
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      body.categories.should.have.length(2);
      body.categories.should.not.include('bad');
      body.content.should.equal(expectedContent);
      body.contentType.should.equal('text/html');
      body.illustration.should.equal(imageUrl);
      body.resources.should.have.length(2);
      body.resources[0].url.should.equal(imageUrl);
      body.resources[0].type.should.equal('image');
      body.resources[0].key.should.equal(hash.hashUrl(imageUrl));
      done();
    });
  });

  it('should found previous document', function(done) {
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

  it('should update previous created document (HTML body)', function(done) {
    var title   = 'Updated sample simple HTML document',
        content = '<p>updated sample</P><img src="' + imageUrl + '"/>',
        expectedContent = '<p>updated sample</p><img app-src="' + imageUrl + '" />',
        categories = ['system-trash'];

    request.put({
      url: url + '/' + docId,
      jar: true,
      qs:  {title: title, categories: categories},
      headers: {
        'Content-Type': 'text/html'
      },
      body: content
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      body = JSON.parse(body);
      body.should.have.property('_id');
      body.title.should.equal(title);
      body.content.should.equal(expectedContent);
      body.categories.should.have.length(1);
      body.categories.should.include('system-trash');
      body.resources.should.have.length(1);
      done();
    });
  });

  it('should create new document (HTML streamed file)', function(done) {
    var title = 'Sample streamed HTML document',
        file  = path.join(__dirname, 'assets', 'gpl.html');

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
      body.resources.should.have.length(0);
      done();
    }));
  });

  it('should create new document (HTML uploaded file)', function(done) {
    var title = 'Sample uploaded HTML document',
        file  = path.join(__dirname, 'assets', 'gpl.html');

    var r = request.post({
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
      body.resources.should.have.length(0);
      done();
    });

    var form = r.form();
    form.append('my_file', fs.createReadStream(file));
  });

  it('should create new document (Image uploaded file)', function(done) {
    var title = 'Sample uploaded image  document',
        file  = path.join(__dirname, 'assets', 'oss.png');

    var r = request.post({
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
      body.should.have.property('attachment');
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      body.contentType.should.match(/^image\/png/);
      body.resources.should.have.length(0);
      done();
    });
    var form = r.form();
    form.append('my_file', fs.createReadStream(file));
  });

  it('should create new document (HTML URL)', function(done) {
    this.timeout(5000);
    var title   = 'Sample online HTML document',
        content = 'http://reader.nunux.org';

    request.post({
      url: url,
      jar: true,
      qs:  {title: title},
      headers: {
        'Content-Type': 'text/vnd.curl'
      },
      body: content
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body = JSON.parse(body);
      body.should.have.properties('_id', 'date');
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      body.contentType.should.match(/^text\/html/);
      body.resources.length.should.be.above(0);
      done();
    });
  });

  it('should create new document (Image URL)', function(done) {
    this.timeout(5000);
    var title = 'Sample online image document';

    request.post({
      url: url,
      jar: true,
      qs:  {title: title},
      headers: {
        'Content-Type': 'text/vnd.curl'
      },
      body: imageUrl
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body = JSON.parse(body);
      docId = body._id;
      body.should.have.properties('_id', 'date', 'attachment');
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      var file = files.chpath(uid, 'documents', body._id, '_' + hash.hashFilename(imageUrl));
      fs.existsSync(file).should.be.true;
      body.attachment.should.equal('_' + hash.hashFilename(imageUrl));
      body.contentType.should.equal('image/png');
      body.resources.should.have.length(0);
      done();
    });
  });

  it('should retrieve document resource (Image)', function(done) {
    var key = hash.hashUrl(imageUrl);
    request.head({
      url: url + '/' + docId + '/resource/_' + key,
      jar: true
    }, function(err, res, body) {
      if (err) return done(err);
      //console.log(res);
      res.statusCode.should.equal(200);
      res.headers['content-type'].should.equal('image/png');
      done();
    });
  });

  it('should find documents', function(done) {
    request.get({
      url: url,
      jar: true,
      qs:  {q: 'Sample'},
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
