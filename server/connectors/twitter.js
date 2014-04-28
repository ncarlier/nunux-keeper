var _        = require('underscore'),
    when     = require('when'),
    Twitter  = require('twit'),
    OAuth    = require('oauth').OAuth,
    User     = require('../models').User,
    Document = require('../models').Document,
    qs       = require('querystring'),
    url      = require('url'),
    errors   = require('../helpers').errors;
    logger   = require('../helpers').logger;


/**
 * Twitter connector.
 * @module twitter
 */
module.exports = function() {
  var disabled = function(req, res, next) {
    return next(new errors.BadRequest('Twitter connector is disabled.'));
  };

  var hastagFilter = process.env.APP_TWITTER_HASHTAG || '#keep';

  if (!process.env.APP_TWITTER_CONSUMER_KEY ||
      !process.env.APP_TWITTER_CONSUMER_SECRET) {
    logger.warn('Twitter configuration not set. Twitter connector will be disabled.');
    return {
      connect: disabled,
      connectCallback: disabled,
      disconnect: disabled
    };
  }

  var twitter = new Twitter({
    consumer_key:        process.env.APP_TWITTER_CONSUMER_KEY,
    consumer_secret:     process.env.APP_TWITTER_CONSUMER_SECRET,
    access_token:        process.env.APP_TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.APP_TWITTER_ACCESS_TOKEN_SECRET
  });

  var ids = {},
      stream = null;

  /**
   * Process a tweet.
   * @param {Object} tweet Tweet to proccess
   */
  var processTweet = function(tweet) {
    User.findOne({'twitter.user_id': tweet.user.id}).exec()
    .then(function(user) {
      if (!user) {
        logger.warn('Receive a Tweet from an unknown user: %s', tweet.user.id);
        return null;
      }
      logger.debug('Receive a Tweet from user: %s. Processing...', user.uid);
      if (tweet.text.indexOf(hastagFilter) < 0) {
        logger.debug('The Tweet does not contains the tracked hashtag. Ignore.');
        return null;
      }
      var doc = {
        content:     tweet,
        contentType: 'application/json',
        owner:       user.uid
      };

      return Document.extract(doc)
      .then(function(_doc) {
        // Create document(s)
        if (_.isArray(_doc)) {
          return when.map(_doc, function(item) {
            return Document.persist(item);
          });
        } else {
          return Document.persist(_doc);
        }
      });
    }, function(err) {
      logger.error('ERROR during processing Tweet %s', tid, err);
    });
  };

  /**
   * Update stream.
   */
  var updateStream = function() {
    if (stream) {
      stream.stop();
    }
    var tIds = _.values(ids);
    if (tIds.length) {
      logger.debug('Streaming %d users of Twitter.', tIds.length);
      stream = twitter.stream('statuses/filter', {follow: tIds.join(',')});
      stream.on('tweet', processTweet);
      // TODO deal with other events!
    } else {
      logger.debug('Streaming with Twitter disabled because no user.');
    }
  };

  // Init.
  logger.debug('Initializing Twitter connector...');
  User.find({twitter: {'$exists': true}}).exec()
  .then(function(users) {
    for (var u in users) {
      var user = users[u];
      ids[user.uid] = user.twitter.user_id;
    }
    updateStream();
    logger.debug('Twitter connector initialized.');
  }, function(err) {
    logger.error('Unable to initialize Twitter connector:', err);
  });

  /**
   * User request connection to Twitter.
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

    var auth = twitter.getAuth();

    var authorize_callback_url = path.href +
      'api/user/' + uid + '/connect/twitter/callback';
    // logger.debug('Authorize callback URL : %s', authorize_callback_url);

    var oa = new OAuth(auth.oauth_request_url,
                       auth.oauth_access_url,
                       auth.consumer_key,
                       auth.consumer_secret,
                       '1.0A',
                       authorize_callback_url,
                       'HMAC-SHA1');
    oa.getOAuthRequestToken(
      function(error, oauth_token, oauth_token_secret, results) {
        if (error) return next(error);
        req.session.twitter = {
          oauth_token: oauth_token,
          oauth_token_secret: oauth_token_secret
        };
        var authorize_url = 'https://api.twitter.com/oauth/authorize';
        res.redirect(authorize_url + '?' +
                     qs.stringify({oauth_token: oauth_token})
        );
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

    var auth = twitter.getAuth();
    var oa = new OAuth(auth.oauth_request_url,
                       auth.oauth_access_url,
                       auth.consumer_key,
                       auth.consumer_secret,
                       '1.0A',
                       null,
                       'HMAC-SHA1');

    var oauth_token = req.session.twitter.oauth_token,
        oauth_token_secret = req.session.twitter.oauth_token_secret;

    var oauth_verifier = req.query.oauth_verifier,
        oauth_token_q = req.query.oauth_token;

    logger.debug('Token in session: %s', oauth_token);
    logger.debug('Token in query: %s', oauth_token_q);
    logger.debug('Token match: %s', oauth_token === oauth_token_q);

    oa.getOAuthAccessToken(
      oauth_token, oauth_token_secret, oauth_verifier,
      function(error, oauth_access_token, oauth_access_token_secret, results) {
        if (error) return next(error);
        User.findByIdAndUpdate(req.user._id, {twitter: results}).exec()
        .then(function(user) {
          logger.info('User (%s) Twitter infos updated: %j', uid, user.twitter);
          ids[user.uid] = user.twitter.user_id;
          updateStream();
          res.redirect('/#/profile');
        }, next);
      }
    );
  };

  /**
   * Disconnect user from Twitter connector.
   * @param {Object} req HTTP request
   * @param {Object} res HTTP response
   * @param {Function} next callback
   */
  var disconnectUser = function(req, res, next) {
    var uid = req.params.id;
    if (uid !== req.user.uid) {
      return next(new errors.Forbidden());
    }

    User.findByIdAndUpdate(req.user._id, {$unset: {twitter: 1 }}).exec()
    .then(function(user) {
      logger.info('User (%s) Twitter infos deleted.', uid);
      delete ids[uid];
      updateStream();
      res.redirect('/#/profile');
    }, next);
  };

  return {
    connect: connectUser,
    connectCallback: connectUserCallback,
    disconnect: disconnectUser
  };
};

