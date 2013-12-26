var api = require('../api');

/**
 * API Routes.
 */
module.exports = function(app) {
  // API info:
  app.get('/api', app.ensureAuthenticated, api.info(app));
  // Documents API:
  app.get('/api/document/:id', app.ensureAuthenticated, api.documents.get);
  app.get('/api/document', app.ensureAuthenticated, api.documents.search);
  app.post('/api/document', app.ensureAuthenticated, api.documents.create);
  app.delete('/api/document', app.ensureAuthenticated, api.documents.del);
  app.delete('/api/document/:id', app.ensureAuthenticated, api.documents.del);
  // Document resources API:
  app.get('/api/document/:id/resource/:key', app.ensureAuthenticated, api.resources.get);
  // Admin API:
  //app.get('/api/admin/user/:id', app.ensureAuthenticated, app.ensureIsAdmin, api.admin.users.get);
};
