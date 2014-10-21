var api = require('../../api');

/**
 * Admin API Routes.
 */
module.exports = function(app) {
  app.get('/api/admin/stats',     api.admin.getStatistics);
  app.get('/api/admin/user/:id',  api.admin.getUser);
  app.post('/api/admin/user/:id', api.admin.createUser);
};
