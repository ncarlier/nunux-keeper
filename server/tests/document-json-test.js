/* jshint -W030 */

var should     = require('should'),
    fs         = require('fs'),
    path       = require('path'),
    request    = require('request'),
    mockServer = require('./common/mock-server');


describe('Check JSON document API', function() {
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

  it('should create new JSON document', function(done) {
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
      docId = body._id;
      done();
    });
  });

  it('should found previous JSON document', function(done) {
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

  it('should delete previous JSON document', function(done) {
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

  it('should create new JSON documents by uploading file)', function(done) {
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

});
