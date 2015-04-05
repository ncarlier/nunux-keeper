/* jshint -W030 */

var should     = require('should'),
    request    = require('request'),
    mockServer = require('./common/mock-server');


describe('Check document API', function() {
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

  it('should create new bookmark document', function(done) {
    this.timeout(5000);
    var title   = 'Sample bookmark document',
        content = 'http://reader.nunux.org';

    request.post({
      url: url,
      jar: true,
      qs:  {title: title},
      headers: {
        'Content-Type': 'text/uri;bookmark'
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
      body.contentType.should.match(/^image\/png/);
      body.attachment.should.equal('capture.png');
      done();
    });
  });

  it('should retrieve document resource (Image)', function(done) {
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
