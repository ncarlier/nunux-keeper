var controller = require('../controllers'),
    middleware = require('../middlewares');

/**
 * Frontend Routes.
 */
module.exports = function(app) {
  var contextHandler = middleware.contextHandler(app);
  // Routes...
  app.get('/', contextHandler, controller.homepage);
  app.get('/login', contextHandler, controller.login);
  app.get('/welcome', contextHandler, controller.welcomepage);
  app.get('/bookmarklet', contextHandler, controller.bookmarklet);
  app.get('/doc/:id', contextHandler, controller.pub.get);
  app.get('/doc/:id/raw', contextHandler, controller.pub.getRaw);
};
