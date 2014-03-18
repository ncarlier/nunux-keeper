var when   = require('when'),
    logger = require('../../../helpers').logger,
    errors = require('../../../helpers').errors,
    uid    = require('../../helpers').uid,
    Client = require('../models').Client;

module.exports = {
  /**
   * Get a client application.
   */
  get: function(req, res, next) {
    Client.findById(req.params.id).exec()
    .then(function(client) {
      res.json(client);
    }, next);
  },

  /**
   * Get all clients applications.
   */
  all: function(req, res, next) {
    Client.find().exec()
    .then(function(data) {
      res.json(data);
    }, next);
  },

  /**
   * Create new client.
   */
  create: function(req, res, next) {
    var client = {
      name: req.body.name,
      homepage: req.body.homepage,
      redirectURI: req.body.redirectURI,
      secret: uid(64)
    };

    Client.count({name: client.name}).exec()
    .then(function(count) {
      if (count > 0) {
        return next(new errors.BadRequest('Client already exists.'));
      }
      // Save client
      return Client.create(client);
    })
    .then(function(_client) {
      logger.info('Client created: %j', _client);
      res.status(201).json(_client);
    }, next);
  },

  /**
   * Put client modification.
   */
  update: function(req, res, next) {
    var update = {};
    if (req.body.name) update.name = req.body.name;
    if (req.body.homepage) update.homepage = req.body.homepage;
    if (req.body.redirectURI) update.redirectURI = req.body.redirectURI;
    update.secret = uid(64);

    Client.findByIdAndUpdate(req.params.id, update).exec()
    .then(function(client) {
      logger.info('Client updated: %j', client);
      res.status(200).json(client);
    }, next);
  },

  /**
   * Delete a client.
   */
  del: function(req, res, next) {
    Client.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      logger.info('Client deleted: %s', req.params.id);
      res.send(205);
    }, next);
  }
};
