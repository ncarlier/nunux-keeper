var getRawBody = require('raw-body');

/**
 * Middleware to handle RAW body of requests.
 */
module.exports = function() {
  return function(req, res, next) {
    if (req._body) return next();
    var ct = req.header('Content-Type');
    if (!/^multipart\/form-data/.test(ct)) {
      getRawBody(req, {
        length: req.headers['content-length'],
        limit: '1mb',
        encoding: 'utf8'
      }, function (err, string) {
        if (err) return next(err);
        req.text = string;
        next();
      });
    } else {
      next();
    }
  };
};
