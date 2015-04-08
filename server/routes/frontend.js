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
  app.get('/doc/:id', contextHandler, controller.pub.getDoc);
  app.get('/doc/:id/raw', contextHandler, controller.pub.getRawDoc);
  app.get('/page/:alias', contextHandler, controller.pub.getPage);
  app.get('/rss/:alias', contextHandler, controller.pub.getRss);
};
