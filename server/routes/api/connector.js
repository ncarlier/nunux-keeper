var api = require('../../api');

/**
 * Connectors API Routes.
 */
module.exports = function(app) {
  // Twitter
  app.get('/api/user/:id/connect/twitter', api.connector.twitter.connect);
  app.get('/api/user/:id/connect/twitter/callback', api.connector.twitter.callback);
  app.get('/api/user/:id/disconnect/twitter', api.connector.twitter.disconnect);
  // Pocket
  app.get('/api/user/:id/connect/pocket', api.connector.pocket.connect);
  app.get('/api/user/:id/connect/pocket/callback', api.connector.pocket.callback);
  app.get('/api/user/:id/disconnect/pocket', api.connector.pocket.disconnect);
  app.get('/api/user/:id/pocket/import', api.connector.pocket.importAll);
};
