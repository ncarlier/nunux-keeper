/* jshint -W030 */

var should     = require('should'),
    fs         = require('fs'),
    path       = require('path'),
    request    = require('request'),
    mockServer = require('./common/mock-server'),
    hash       = require('../helpers').hash;


describe('Check HTML document API', function() {
  var url = mockServer.getRealm() + '/api/document',
      imageUrl = 'http://reader.nunux.org/icons/favicon.png?foo=bar',
      uid = 'foo@bar.com';
  var docId, resourceKey;

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

  it('should create new HTML document', function(done) {
    this.timeout(5000);
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
      body.resources[0].type.should.equal('image/png');
      body.resources[0].key.should.equal(hash.hashUrl(imageUrl));
      done();
    });
  });

  it('should found previous HTML document', function(done) {
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

  it('should update previous HTML document', function(done) {
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

  it('should delete previous HTML document', function(done) {
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

  it('should create new HTML document (streamed file)', function(done) {
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

  it('should create new HTML document (uploaded file)', function(done) {
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

  it('should create new HTML document (given URL)', function(done) {
    this.timeout(5000);
    var title   = 'Sample online HTML document',
        content = 'http://reader.nunux.org';

    request.post({
      url: url,
      jar: true,
      qs:  {title: title},
      headers: {
        'Content-Type': 'text/uri'
      },
      body: content
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(201);
      body = JSON.parse(body);
      docId = body._id;
      body.should.have.properties('_id', 'date');
      body.title.should.equal(title);
      body.owner.should.equal(uid);
      body.contentType.should.match(/^text\/html/);
      body.resources.length.should.be.above(0);
      resourceKey = body.resources[0].key;
      done();
    });
  });

  it('should retrieve previous HTML document resource', function(done) {
    request.head({
      url: url + '/' + docId + '/resource/' + resourceKey,
      jar: true
    }, function(err, res, body) {
      if (err) return done(err);
      //console.log(res);
      res.statusCode.should.equal(200);
      res.headers['content-type'].should.equal('image/png');
      done();
    });
  });

  it('should retrieve previous HTML document resource thumbnail', function(done) {
    request.head({
      url: url + '/' + docId + '/resource/' + resourceKey,
      qs:  {size: '200x150'},
      jar: true
    }, function(err, res, body) {
      if (err) return done(err);
      res.statusCode.should.equal(200);
      res.headers['content-type'].should.equal('image/png');
      done();
    });
  });

});
