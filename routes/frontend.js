var controller = require('../controllers');

/**
 * Frontend Routes.
 */
module.exports = function(app) {
  /**
   * Middleware to setup default context.
   */
  var setupContext = function (req, res, next) {
    req.context = {
      info: app.get('info'),
      realm: app.get('realm'),
      env: app.get('env'),
      user: req.user
    };

    next();
  };

  // Routes...
  app.get('/', setupContext, controller.homepage);
  app.get('/welcome', setupContext, controller.welcomepage);
};
