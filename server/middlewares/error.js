var _      = require('underscore'),
    logger = require('../helpers').logger;

/**
 * Middleware to handle errors.
 */
module.exports = function(app) {
  return function(err, req, res, next) {
    res.status(err.status || 500);
    if (res.statusCode >= 400 && res.statusCode != 404) logger.error(err);
    var error = _.isString(err) ? err : (_.isObject(err) ? err.message : 'Unknown Error');
    res.format({
      html: function() {
        res.render('error', {error: error, info: app.get('info')});
      },
      json: function(){
        res.json({error: error});
      }
    });
  };
};
