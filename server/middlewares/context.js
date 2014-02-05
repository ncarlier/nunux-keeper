/**
 * Middleware to populate application context infos.
 */
module.exports = function(app) {
  return function (req, res, next) {
    req.context = {
      info: app.get('info'),
      realm: app.get('realm'),
      env: app.get('env'),
      user: req.user
    };

    next();
  };
};
