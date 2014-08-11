var when     = require('when'),
    User     = require('../models').User,
    Document = require('../models').Document,
    files = require('../helpers').files;


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
      stats.diskUsage = err;
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
    User.create({uid: req.params.id})
    .then(function(result) {
      res.status(201).json({msg: 'User ' + req.params.id + ' created.'});
    }, next);
  },
};
