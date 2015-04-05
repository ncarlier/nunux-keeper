/* jshint -W030 */

var should     = require('should'),
    fs         = require('fs'),
    path       = require('path'),
    request    = require('request'),
    mockServer = require('./common/mock-server');


describe('Check image document API', function() {
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

  it('should create new image document', function(done) {
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
      docId = body._id;
      done();
    });
    var form = r.form();
    form.append('my_file', fs.createReadStream(file));
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
