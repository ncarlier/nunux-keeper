var api = require('../api');

/**
 * API Routes.
 */
module.exports = function(app) {
  // API info:
  app.get('/api', api.info(app));
  // User API:
  app.put('/api/user/:id', api.user.update);
  app.get('/api/user/:id/connect/twitter', api.connector.twitter.connect);
  app.get('/api/user/:id/connect/twitter/callback', api.connector.twitter.callback);
  app.get('/api/user/:id/disconnect/twitter', api.connector.twitter.disconnect);
  // Documents API:
  app.get('/api/document', api.documents.search);
  app.get('/api/document/:id', api.documents.get);
  app.put('/api/document/:id', api.documents.update);
  app.post('/api/document', api.documents.create);
  app.delete('/api/document', api.documents.del);
  app.delete('/api/document/:id', api.documents.del);
  // Document resources API:
  app.get('/api/document/:id/resource/:key', api.resources.get);
  // Categories API:
  app.get('/api/category', api.categories.all);
  app.get('/api/category/:key', api.categories.get);
  app.put('/api/category/:key', api.categories.update);
  app.post('/api/category', api.categories.create);
  app.delete('/api/category/:key', api.categories.del);
  // Admin API:
  //app.get('/api/admin/user/:id', api.admin.users.get);
};
