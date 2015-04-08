var when       = require('when'),
    _          = require('underscore'),
    logger     = require('../helpers').logger,
    errors     = require('../helpers').errors,
    validators = require('../helpers').validators,
    User       = require('../models').User;

module.exports = {
  /**
   * Get current user infos.
   */
  get: function(req, res, next) {
    return res.json(req.user);
  },

  /**
   * Put user modification.
   */
  update: function(req, res, next) {
    var update = {};
    // Sanitize and validate data
    update.publicAlias = req.body.publicAlias;
    if (update.publicAlias && !validators.isPublicAlias(update.publicAlias)) {
      return next(new errors.BadRequest('Alias is not valid.'));
    }
    if (_.isEmpty(update)) {
      logger.debug('User not updated. Update object is empty.');
      return res.status(200).json(req.user);
    }

    User.findByIdAndUpdate(req.user._id, update).exec()
    .then(function(user) {
      logger.info('User updated: %j', user);
      res.status(200).json(user);
    }, next);
  }
};
