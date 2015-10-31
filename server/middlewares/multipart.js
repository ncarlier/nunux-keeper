var os         = require('os'),
    path       = require('path'),
    multiparty = require('multiparty');

var uploadDir = process.env.APP_VAR_DIR ? path.join(process.env.APP_VAR_DIR, 'upload') : os.tmpdir();

/**
 * Middleware to handle multipart/form-data requests.
 * @module multipart
 */
module.exports = function() {
  return function(req, res, next) {
    var ct = req.header('Content-Type');
    if (req.method === 'POST' && /^multipart\/form-data/.test(ct)) {
      var form = new multiparty.Form({uploadDir: uploadDir});

      req.files = [];
      req.fields = {};

      form.on('error', next);
      form.on('file', function(name, file) {
        req.files.push(file);
      });
      form.on('field', function(name, value) {
        req.fields[name] = value;
      });
      form.on('close', function() {
        next();
      });

      form.parse(req);
    } else {
      next();
    }
  };
};
