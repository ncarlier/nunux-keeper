var logger = require('../helpers').logger,
    when   = require('when');

/**
 * Document object model.
 */
module.exports = function(db) {

  var UserSchema = new db.Schema({
    uid: { type: String, index: { unique : true } },
    username: { type: String },
    date: { type: Date, default: Date.now }
  });

  UserSchema.static('login', function(user, done) {
    var autoGrantAccess = process.env.APP_AUTO_GRANT_ACCESS !== 'false';
    var logged = when.defer();
    var query = this.findOne().where('uid').equals(user.uid);

    query.exec().then(function(_user) {
      if (_user) {
        // Return the user.
        logger.info('User %s authorized.', _user.uid);
        logged.resolve(_user);
      } else if (autoGrantAccess) {
        // Create the user.
        _user = new User(user);
        logger.info('User %s authorized. Will be created.', _user.uid);
        _user.save().then(logged.resolve, logged.reject);
      } else {
        // User not found and auto grant access is disabled.
        logger.warn('User %s not authorized.', _user.uid);
        logged.reject('ENOTAUTHORIZED');
      }
    }, logged.reject);

    return logged.promise;
  });

  return db.model('User', UserSchema);
};

