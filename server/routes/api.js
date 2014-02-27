var api = require('../api');

/**
 * API Routes.
 */
module.exports = function(app) {
  // API info:
  app.get('/api', app.ensureAuthenticated, api.info(app));
  // User API:
  app.put('/api/user/:id', app.ensureAuthenticated, api.user.update);
  // Documents API:
  app.get('/api/document', app.ensureAuthenticated, api.documents.search);
  app.get('/api/document/:id', app.ensureAuthenticated, api.documents.get);
  app.put('/api/document/:id', app.ensureAuthenticated, api.documents.update);
  app.post('/api/document', app.ensureAuthenticated, api.documents.create);
  app.delete('/api/document', app.ensureAuthenticated, api.documents.del);
  app.delete('/api/document/:id', app.ensureAuthenticated, api.documents.del);
  // Document resources API:
  app.get('/api/document/:id/resource/:key', app.ensureAuthenticated, api.resources.get);
  // Categories API:
  app.get('/api/category', app.ensureAuthenticated, api.categories.all);
  app.get('/api/category/:key', app.ensureAuthenticated, api.categories.get);
  app.put('/api/category/:key', app.ensureAuthenticated, api.categories.update);
  app.post('/api/category', app.ensureAuthenticated, api.categories.create);
  app.delete('/api/category/:key', app.ensureAuthenticated, api.categories.del);
  // Admin API:
  //app.get('/api/admin/user/:id', app.ensureAuthenticated, app.ensureIsAdmin, api.admin.users.get);
};
