/* jshint -W030 */

var should     = require('should'),
    fs         = require('fs'),
    request    = require('request'),
    mockServer = require('./common/mock-server'),
    files      = require('../helpers').files;


describe('Check URL document API', function() {
  var url = mockServer.getRealm() + '/api/document',
      imageUrl = 'http://reader.nunux.org/icons/favicon.png?foo=bar',
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

  it('should create new image document', function(done) {
    this.timeout(5000);
    var title = 'Sample online image document';

    request.post({
      url: url,
      jar: true,
      qs:  {title: title},
      headers: {
        'Content-Type': 'text/uri'
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
      var file = files.chpath(uid, 'documents', body._id, 'attachment', 'favicon.png');
      fs.existsSync(file).should.be.true;
      body.attachment.should.equal('favicon.png');
      body.contentType.should.equal('image/png');
      body.resources.should.have.length(0);
      done();
    });
  });

  it('should retrieve previous image document attachment', function(done) {
    request.head({
      url: url + '/' + docId + '/attachment',
      jar: true
    }, function(err, res, body) {
      if (err) return done(err);
      //console.log(res);
      res.statusCode.should.equal(200);
      res.headers['content-type'].should.equal('image/png');
      done();
    });
  });

});
