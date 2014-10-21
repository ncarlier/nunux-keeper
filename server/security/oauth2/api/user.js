var when        = require('when'),
    errors      = require('../../../helpers').errors,
    logger      = require('../../../helpers').logger,
    AccessToken = require('../models').AccessToken;
    Client      = require('../models').Client;

module.exports = {
  /**
   * Get user's clients.
   */
  getClients: function(req, res, next) {
    var uid = req.params.id;
    if (uid !== req.user.uid) {
      return next(new errors.Forbidden());
    }

    AccessToken.find({userId: uid}).exec()
    .then(function(tokens) {
      logger.debug('User %s has %d tokens', uid, tokens.length);
      return when.map(tokens, function(token) {
        return Client.findById(token.clientId, 'name homepage').exec();
      });
    })
    .then(function(clients) {
      res.json(clients);
    }, next);
  },
  /**
   * Revoke user's client.
   */
  revokeClient: function(req, res, next) {
    var uid = req.params.uid;
    if (uid !== req.user.uid) {
      return next(new errors.Forbidden());
    }
    var cid = req.params.cid;

    AccessToken.remove({userId: uid, clientId: cid}).exec()
    .then(function() {
      logger.info('Access revoked of app %s for user %', uid, cid);
      res.send(205);
    }, next);
  }

};
