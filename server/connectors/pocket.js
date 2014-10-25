var _        = require('underscore'),
    when     = require('when'),
    request  = require('request'),
    OAuth    = require('oauth').OAuth,
    User     = require('../models').User,
    Document = require('../models').Document,
    qs       = require('querystring'),
    url      = require('url'),
    errors   = require('../helpers').errors,
    logger   = require('../helpers').logger;


/**
 * Pocket connector.
 * @module pocket
 */
module.exports = function() {
  var disabled = function(req, res, next) {
    return next(new errors.BadRequest('Pocket connector is disabled.'));
  };

  if (!process.env.APP_POCKET_CONSUMER_KEY) {
    logger.warn('Pocket configuration not set. Pocket connector will be disabled.');
    return {
      connect: disabled,
      connectCallback: disabled,
      disconnect: disabled,
      importAll: disabled
    };
  }

  var defaults = {
    oauth_request_url: 'https://getpocket.com/v3/oauth/request',
    oauth_access_url:  'https://getpocket.com/v3/oauth/authorize',
    authorize_url:     'https://getpocket.com/auth/authorize',
    consumer_key:      process.env.APP_POCKET_CONSUMER_KEY,
    get_url:          'https://getpocket.com/v3/get'
  };

  /**
   * Import Pocket data.
   * @param {Object} req HTTP request
   * @param {Object} res HTTP response
   * @param {Function} next callback
   */
  var importAll = function(req, res, next) {
    if (!req.user.pocket || !req.user.pocket.access_token) {
      return next(new errors.BadRequest('User not linked with Pocket.'));
    }
    // Get all documents
    var query = {
      consumer_key: defaults.consumer_key,
      access_token: req.user.pocket.access_token,
      state: 'all',
      sort: 'newest',
      detailType: 'complete',
      since: req.user.pocket.since
    };
    request.get({
      url: defaults.get_url,
      qs: query
    }, function(err, _res, _body) {
      if (err) return next(err);
      if (_res.statusCode >= 400) return next(_body);
      var data = JSON.parse(_body);
      processData(req.user, data)
      .then(function() {
        logger.debug('Data imported. Updating user pocket.since: %s', data.since);
        return User.findByIdAndUpdate(req.user._id, {'pocket.since': data.since}).exec();
      })
      .then(function() {
        var message = 'Pocket data successfully imported';
        logger.info(message + 'for user %s.', req.user.uid);
        res.redirect('/#/profile?info=' + encodeURIComponent(message));
      }, function(e) {
        res.redirect('/#/profile?error=' + encodeURIComponent(e));
      });
    });
  };

  /**
   * Process a Pocket data.
   * @param {User} user User
   * @param {Object} data Data to proccess
   */
  var processData = function(user, data) {
    if (!data.list) {
      return when.reject('Pocket data not well formed.');
    }
    logger.debug('Importing %d Pocket item(s)...', Object.keys(data.list).length);
    return when.map(_.values(data.list), function(item) {
      var doc = {
        content:     item,
        contentType: 'application/json',
        owner:       user.uid
      };
      return Document.extract(doc)
      .then(function(_doc) {
        return Document.persist(_doc);
      });
    }, function(err) {
      logger.error('ERROR during processing Pocket data.', err);
      return when.reject(err);
    });
  };

  /**
   * User request connection to Pocket.
   * @param {Object} req HTTP request
   * @param {Object} res HTTP response
   * @param {Function} next callback
   */
  var connectUser = function(req, res, next) {
    var uid = req.params.id;
    if (uid !== req.user.uid) {
      return next(new errors.Forbidden());
    }

    var scheme = req.socket.secure ? 'https://' : 'http://';
    var path = url.parse(scheme + req.headers.host, true);

    var authorize_callback_url = path.href +
      'api/user/' + uid + '/connect/pocket/callback';

    // Get request token
    var form = {
      consumer_key: defaults.consumer_key,
      redirect_uri: authorize_callback_url
    };
    var headers = {
      'X-accept': 'application/json'
    };
    request.post({
      url: defaults.oauth_request_url,
      headers: headers,
      form: form
    }, function(err, _res, _body) {
      if (err) return next(err);
      var b = JSON.parse(_body);
      req.session.pocket = {
        code: b.code
      };
      res.redirect(defaults.authorize_url + '?' + qs.stringify({
        request_token: b.code,
        redirect_uri: authorize_callback_url
      }));
      res.end();
      return;
    });
  };

  /**
   * Connect callback (OAuth authorize callback).
   * @param {Object} req HTTP request
   * @param {Object} res HTTP response
   * @param {Function} next callback
   */
  var connectUserCallback = function(req, res, next) {
    var uid = req.params.id;
    if (uid !== req.user.uid) {
      return next(new errors.Forbidden());
    }

    var code = req.session.pocket.code;

    // Get access token
    var form = {
      consumer_key: defaults.consumer_key,
      code: code
    };
    var headers = {
      'X-accept': 'application/json'
    };
    request.post({
      url: defaults.oauth_access_url,
      headers: headers,
      form: form
    }, function(err, _res, _body) {
      if (err) return next(err);
      var results = JSON.parse(_body);
      User.findByIdAndUpdate(req.user._id, {pocket: results}).exec()
      .then(function(user) {
        logger.info('User (%s) Pocket infos updated: %j', uid, user.pocket);
        res.redirect('/#/profile');
      }, next);
    });
  };

  /**
   * Disconnect user from Pocket connector.
   * @param {Object} req HTTP request
   * @param {Object} res HTTP response
   * @param {Function} next callback
   */
  var disconnectUser = function(req, res, next) {
    var uid = req.params.id;
    if (uid !== req.user.uid) {
      return next(new errors.Forbidden());
    }

    User.findByIdAndUpdate(req.user._id, {$unset: {pocket: 1 }}).exec()
    .then(function(user) {
      logger.info('User (%s) Pocket infos deleted.', uid);
      res.redirect('/#/profile');
    }, next);
  };

  return {
    connect: connectUser,
    connectCallback: connectUserCallback,
    disconnect: disconnectUser,
    importAll: importAll
  };
};

