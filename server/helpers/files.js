var when   = require('when'),
    path   = require('path'),
    fs     = require('fs-extra'),
    nodefn = require('when/node/function'),
    logger = require('./logger');

var varDir = process.env.APP_VAR_DIR || path.normalize(path.join(__dirname, '..', '..', 'var'));

/**
 * Make directories recusively (mkdir -p)
 * @param {String} p Full directory path
 * @returns {Promise} A promise with direcory path as parameter
 */
var mkdirs = function(p) {
  var created = when.defer();
  fs.exists(p, function (exists) {
    if (exists) return created.resolve(p, true);
    var ps = path.normalize(p).split('/');
    mkdirs(ps.slice(0,-1).join('/')).then(function(_p) {
      logger.debug('Create directory: %s', p);
      nodefn.call(fs.mkdir, p, '0755').then(function() {
        created.resolve(p);
      }, created.reject);
    }, created.reject);
  });

  return created.promise;
};

/**
 * Get chrooted path.
 * Aka a safe path under APP_VAR_DIR.
 * @param {String[]} _ composition of the path
 * @returns {String} absolute chrooted path
 */
var getChrootPath = function() {
  var p = path.normalize(path.join.apply(null, arguments));
  if (p.indexOf(varDir) === 0) {
    return p;
  } else {
    // logger.debug('Path "%s" will be chrooted in: %s', p, varDir);
    [].unshift.apply(arguments, [varDir]);
    return path.normalize(path.join.apply(null, arguments));
  }
};

/**
 * Write Stream to chrooted location.
 * @param {Stream} stream
 * @param {String} to file destination
 * @returns {Promise} A promise with path file as parameter
 */
var writeToChroot = function(stream, to) {
  to = getChrootPath(to);
  var writed = when.defer();

  fs.exists(to, function(exists) {
    if (exists) {
      logger.debug('File already exists: %s', to);
      return writed.resolve(to);
    }
    writer = fs.createWriteStream(to);
    logger.debug('Creating file: %s', to);
    try {
      var r = stream.pipe(writer);
      r.on('error', function(err) {
        logger.error('Error while creatinfg file: %s', to, err);
        writed.reject(err);
      });
      r.on('close', function() {
        logger.debug('File created: %s', to);
        writed.resolve(to);
      });
    } catch(e) {
      logger.error('Error during writeToChroot %s : %j', to, e);
      writed.reject(e);
    }
  });
  return writed.promise;
};

/**
 * Move file between chrooted locations.
 * @param {String} src
 * @param {String} dest
 * @returns {Promise} A promise of the move
 */
var moveInChroot = function(src, dest) {
  src = getChrootPath(src);
  dest = getChrootPath(dest);
  var filename = path.basename(src);
  dest = path.join(dest, filename);
  logger.debug('Move file %s to %s', src, dest);
  return nodefn.call(fs.rename, src, dest);
};

/**
 * Get disk usage of chrooted location.
 * @param {string} loc
 * @return {Promise} A promise of th disk usage
 */
var getChrootDiskUsage = function(loc) {
  loc = getChrootPath(loc);
  return nodefn.call(fs.lstat, loc)
  .then(function(stats) {
    if (stats.isDirectory()) {
      return nodefn.call(fs.readdir, loc)
      .then(function(list) {
        var subs = [];
        list.forEach(function(item) {
          subs.push(getChrootDiskUsage(path.join(loc, item)));
        });
        if (subs.length) {
          return when.reduce(subs, function(sum, value) {
            return sum += value;
          });
        } else return when.resolve(stats.size);
      });
    } else {
      return when.resolve(stats.size);
    }
  });
};

/**
 * Test if file exists.
 * @param {String} file file to test
 * @return {Promise} promise of the test
 */
var chexists = function(file) {
  var found = when.defer();
  fs.exists(file, function(exists) {
    return found.resolve(exists);
  });
  return found.promise;
};

/**
 * File system helpers.
 * @module files
 */
module.exports = {
  /** Get main chroot directory. */
  chpwd: function() { return varDir; },
  /** @see getChrootPath() */
  chpath: getChrootPath,
  /** @see writeToChroot() */
  chwrite: writeToChroot,
  /** Make directory in chrooted location. */
  chmkdir: function() { return mkdirs(getChrootPath.apply(null, arguments)); },
  /** @see moveInChroot() */
  chmv: moveInChroot,
  /** Remove file or directory in chrooted location. */
  chrm: function() { return nodefn.call(fs.remove, getChrootPath.apply(null, arguments)); },
  /** Get file stream in chrooted location. */
  chstream: function() { return when.resolve(fs.createReadStream(getChrootPath.apply(null, arguments))); },
  /** Get file stat in chrooted location. */
  chstat: function() { return nodefn.call(fs.stat, getChrootPath.apply(null, arguments)); },
  /** Get disk usage in chrooted location. */
  chdu: getChrootDiskUsage,
  /** Test if path exists. */
  chexists: chexists,
  /** List directory content. */
  chls: function() { return nodefn.call(fs.readdir, getChrootPath.apply(null, arguments)); }
};
