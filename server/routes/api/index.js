var api = require('../../api');

/**
 * API Routes.
 */
module.exports = function(app) {
  // API info:
  app.get('/api', api.info(app));
  // Admin API
  require('./admin')(app);
  // Document API
  require('./document')(app);
  // Category API
  require('./category')(app);
  // User API
  require('./user')(app);
  // Connector API
  require('./connector')(app);
};
