var logger = require('../helpers').logger,
    when   = require('when'),
    hat    = require('hat'),
    crypto = require('crypto');

/**
 * Document object model.
 */
module.exports = function(db, conn) {

  var UserSchema = new db.Schema({
    uid:         { type: String, index: { unique: true } },
    username:    { type: String },
    date:        { type: Date, default: Date.now },
    publicAlias: { type: String, index: { unique: true } },
    apiToken:    { type: String, index: { unique: true } }
  });

  UserSchema.static('login', function(user) {
    var self = this;
    var autoGrantAccess = process.env.APP_AUTO_GRANT_ACCESS !== 'false';
    var query = this.findOne().where('uid').equals(user.uid);

    var logged = query.exec().then(function(_user) {
      if (_user) {
        // Return the user.
        logger.info('User %s authorized.', _user.uid);
        return when.resolve(_user);
      } else if (autoGrantAccess || user.uid === process.env.APP_ADMIN) {
        // Create the user.
        logger.info('User %s authorized. Will be created.', user.uid);
        user.publicAlias = crypto.createHash('md5').update(user.uid).digest('hex');
        user.apiToken = hat();
        return self.create(user);
      } else {
        // User not found and auto grant access is disabled.
        logger.warn('User %s not authorized.', user.uid);
        return when.reject('ENOTAUTHORIZED');
      }
    });

    return logged;
  });

  return conn.model('User', UserSchema);
};

