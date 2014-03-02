/**
 * Middleware to handle Cross-Origin Resource Sharing requests.
 */
module.exports = function() {
  return function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, X-Auth-Token');
    next();
  };
};
