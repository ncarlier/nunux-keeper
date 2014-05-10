var User   = require('../models/user'),
    errors = require('../helpers').errors;

module.exports = {
  /**
   * Get current user infos.
   */
  get: function(req, res, next) {
    return res.json(req.user);
  }
};
