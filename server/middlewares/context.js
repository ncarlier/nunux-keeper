var crypto = require('crypto');

/**
 * Middleware to populate application context infos.
 */
module.exports = function(app) {
  return function (req, res, next) {
    var gravatar;
    if (req.user) {
      gravatar = crypto.createHash('md5')
      .update(req.user.uid.toLowerCase()).digest('hex');
    }
    req.context = {
      info: app.get('info'),
      realm: app.get('realm'),
      env: app.get('env'),
      user: req.user,
      gravatar: gravatar
    };

    next();
  };
};
