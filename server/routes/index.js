var api      = require('./api'),
    frontend = require('./frontend');

/**
 * Server routes.
 * @module routes
 */
module.exports = function(app) {
  return {
    /**
     * API routes.
     */
    api: api(app),
    /**
     * Frontend routes.
     */
    frontend: frontend(app)
  };
};
