/**
 * Middleware to handle RAW body of requests.
 */
module.exports = function() {
  return function(req, res, next) {
    if (req._body) return next();
    req.rawBody = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
      req.rawBody += chunk;
    });
    req.on('end', next);
  };
};
