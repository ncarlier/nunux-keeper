var api = require('../api');

/**
 * API Routes.
 */
module.exports = function(app) {
  // Documents API
  app.get('/api/document/:id', app.ensureAuthenticated, api.documents.get);
  app.post('/api/document', app.ensureAuthenticated, api.documents.create);
  app.delete('/api/document/:id', app.ensureAuthenticated, api.documents.del);
};
