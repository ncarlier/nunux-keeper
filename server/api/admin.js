var when     = require('when'),
    crypto   = require('crypto'),
    User     = require('../models').User,
    Document = require('../models').Document,
    storage  = require('../storage'),
    logger   = require('../helpers').logger,
    files    = require('../helpers').files;


var getUserStats = function(user) {
  var stats = {
    uid: user.uid,
  };
  // Count documents
  return Document.count({owner: user.uid}).exec()
  .then(function(count) {
    stats.documents = count;
    // Count disk usage
    return files.chdu(files.chpath(user.uid))
    .then(function(usage) {
      stats.diskUsage = usage;
      return when.resolve(stats);
    }, function(err) {
      stats.diskUsage = err.errno == 34 ? 0 : err;
      return when.resolve(stats);
    });
  });
};

module.exports = {
  /**
   * Get usersstatistics.
   */
  getStatistics: function(req, res, next) {
    User.find().lean().exec()
    .then(function(users) {
      var stats = [];
      users.forEach(function(user) {
        stats.push(getUserStats(user));
      });
      return when.all(stats);
    })
    .then(function(results) {
      res.json(results);
    }, next);
  },

  /**
   * Get user.
   */
  getUser: function(req, res, next) {
    var result = null;
    User.findOne({
      uid: req.params.id
    }).lean().exec()
    .then(function(user) {
      result = user;
      return getUserStats(user);
    })
    .then(function(stats) {
      result.documents = stats.documents;
      result.diskUsage = stats.diskUsage;
      res.json(result);
    }, next);
  },

  /**
   * Create new user.
   */
  createUser: function(req, res, next) {
    var alias = crypto.createHash('md5').update(req.params.id).digest('hex');
    User.create({uid: req.params.id, publicAlias: alias})
    .then(function(result) {
      res.status(201).json({msg: 'User ' + req.params.id + ' created.'});
    }, next);
  },

  /**
   * Delete an user.
   */
  deleteUser: function(req, res, next) {
    var uid = req.params.id;
    if (req.user.uid == uid) {
      return next(new errors.BadRequest('Unable to self destroy.'));
    }
    logger.info('Deleting documents of user %s ...', uid);
    Document.remove({owner: uid}).exec()
    .then(function() {
      logger.info('Deleting files of user %s ...', uid);
      return storage.remove(storage.getContainerName(uid));
    })
    .then(function() {
      logger.info('Deleting user %s ...', uid);
      return User.remove({uid: uid}).exec();
    })
    .then(function() {
      logger.info('User %s deleted.', uid);
      res.send(205);
    }, next);
  }

};
