var when   = require('when'),
    path   = require('path'),
    fs     = require('fs'),
    nodefn = require('when/node/function'),
    crypto = require('crypto'),
    logger = require('./logger');

var varDir = process.env.APP_VAR_DIR || path.join(__dirname, '..', '..', 'var');

var mkdir = function(p) {
  var created = when.defer();
  fs.exists(p, function (exists) {
    if (exists) return created.resolve(p, true);
    var ps = path.normalize(p).split('/');
    mkdir(ps.slice(0,-1).join('/')).then(function(_p) {
      logger.debug('Create directory: %s', p);
      nodefn.call(fs.mkdir, p, '0755').then(function() {
        created.resolve(p);
      }, created.reject);
    }, created.reject);
  });

  return created.promise;
};

/**
 * File system helpers.
 */
module.exports = {
  getFilePath: function(dir, name) {
    var filename = crypto.createHash('md5').update(name).digest('hex');
    return path.join(dir, filename);
  },
  writeStream: function(stream, to) {
    var writed = when.defer(),
        writer = fs.createWriteStream(to);

    logger.debug('Create file: %s', to);
    var r = stream.pipe(writer);
    r.on('error', writed.reject);
    r.on('close', writed.resolve);
    return writed.promise;
  },
  mkdir: function(uid, type) {
    return mkdir(path.join(varDir, uid, type));
  }
};
