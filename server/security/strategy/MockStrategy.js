var passport = require('passport'),
    util = require('util');

function MockStrategy(options, verify) {
  this.name = 'mock';
  this.passAuthentication = options.passAuthentication || true;
  this.uid = options.uid || "foo@bar.com";
  this.verify = verify;
}

util.inherits(MockStrategy, passport.Strategy);

MockStrategy.prototype.authenticate = function authenticate(req) {
  if (this.passAuthentication) {
    var user = {uid: this.uid}, self = this;
    this.verify(user, function(err, resident) {
      if(err) {
        self.fail(err);
      } else {
        self.success(resident);
      }
    });
  } else {
    this.fail('Unauthorized');
  }
};

module.exports = MockStrategy;
