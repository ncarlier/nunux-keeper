var _      = require('underscore'),
    when   = require('when'),
    fs     = require('fs'),
    path   = require('path'),
    nodefn = require('when/node/function'),
    knox   = require('knox'),
    files  = require('../../helpers').files,
    logger = require('../../helpers').logger;


var client = knox.createClient({
  endpoint: process.env.APP_STORAGE_S3_HOST,
  bucket:   process.env.APP_STORAGE_S3_BUCKET,
  key:      process.env.APP_STORAGE_S3_ACCESS_KEY,
  secret:   process.env.APP_STORAGE_S3_SECRET_KEY,
  style:    'path'
});

/**
 * Get resource infos.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the resource infos
 */
var info = function(container, entry) {
  var p = getContainerName(container, entry);
  var result = when.defer();
  logger.debug('Get meta info from S3 object: %s/%s', container, entry);
  client.head(p).on('response', function(res) {
    if (200 == res.statusCode) {
      var infos = {
        driver: 's3',
        size: res.headers['content-length'],
        type: res.headers['content-type'],
        mtime: new Date(res.headers.date),
        path: p,
        container: container,
        key: entry
      };
      logger.debug('Get meta info from S3 object: %s/%s', container, entry, infos);
      return result.resolve(infos);
    } else {
      logger.error('Error while getting meta info from S3 object: %s', p, res);
      result.reject(res.body);
    }
  }).end();
  return result.promise;
};

/**
 * Get resource stream.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the resource stream
 */
var stream = function(container, entry) {
  var p = getContainerName(container, entry);

  var result = when.defer();
  logger.debug('Get stream from S3 object: %s/%s', container, entry);
  client.getFile(p, function(err, res) {
    if (err || res.statusCode !== 200) {
      logger.error('Error while getting S3 object: %s', p, err || res);
      result.reject('ES3STREAM');
    } else {
      result.resolve(res);
    }
  });
  return result.promise;
};

/**
 * Store resource into a container.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @param {String} s Resource stream
 * @param {Object} options Resource options (type, size, etc)
 * @return {Promise} Promise of the action
 */
var store = function(container, entry, s, options) {
  var p = getContainerName(container, entry);
  logger.debug('Store S3 object: %s/%s', container, entry);
  var result = when.defer();
  var req = client.put(p, options);
  s.pipe(req);
  req.on('response', function(res){
    if (200 === res.statusCode) {
      return result.resolve(p);
    } else {
      logger.error('Error while storing S3 object: %s [%d]', p, res.statusCode);
      //console.log(res)
      return result.reject('ES3STORE');
    }
  });
  return result.promise;
};

/**
 * Move resource from a container to another.
 * @param {String} containerSource Container source name
 * @param {String} entry Resource name
 * @param {String} containerDest Container dest name
 * @return {Promise} Promise of the action
 */
var move = function(containerSource, entry, containerDest) {
  var srcPath  = getContainerName(containerSource, entry),
      destPath = getContainerName(containerDest, entry);

  var result = when.defer();
  logger.debug('Move S3 object: %s to %s', srcPath, destPath);
  // FIXME S3 copy don't work and copy an empty file :(
  client.copy(srcPath, destPath).on('response', function (res) {
    if (200 == res.statusCode) {
      client.del(srcPath).on('response', function (_res) {
        if (204 == _res.statusCode) {
          result.resolve();
        } else {
          logger.error('Error while deleting S3 object: %s [%d]', srcPath, _res.statusCode);
          result.reject('ES3DEL');
        }
      }).end();
      result.resolve();
    } else {
      logger.error('Error while copying S3 object: %s to %s', srcPath, destPath, res);
      return when.reject(res.body);
    }
  }).end();
  return result.promise;
};

/**
 * Remove resource.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the action
 */
var remove = function(container, entry) {
  var p = getContainerName(container, entry);
  var result = when.defer();
  logger.debug('Remove S3 object: %s/%s', container, entry);
  client.del(p).on('response', function (res) {
    if (200 == res.statusCode) {
      result.resolve();
    } else {
      logger.error('Error while removing S3 object: %s/%s', container, entry, res);
      return result.reject('ES3REMOVE');
    }
  }).end();
  return result.promise;
};

/**
 * Get container name.
 * @param {String...} arguments name parts
 * @return {String} Container name
 */
var getContainerName = function() {
  return path.normalize(path.join.apply(null, arguments));
};

/**
 * List resources in the container.
 * @param {String} container container name
 * @return {Promise} Promise of the action
 */
var _listContainer = function(container) {
  return nodefn.call(client.list, {prefix: container})
  .then(function(data) {
    return when.resolve(_.pluck(data.contents, 'key'));
  }, function(err) {
    logger.error('Error while listing data from S3 container: %s', container, res);
    return when.reject(err);
  });
};

/**
 * Clean container by removing all entries no present in the resource list.
 * @param {String} container Container name
 * @param {Object[]} resources Resource list
 * @retrun {Promise} Promise of the action
 */
var cleanContainer = function(container, resources) {
  var keys = _.pluck(resources, 'key');

  // List directory content...
  logger.debug('Cleanup S3 container: %s', container);
  return _listContainer(container)
  .then(function(entries) {
    // Get delta between directory content and key list
    var delta = _.difference(entries, keys);
    return when.map(delta, function(entry) {
      // Remove files delta.
      logger.debug('Removing unused resource: %s ...', entry);
      return remove(container, entry);
    });
  });
};

/**
 * Get a local copy of the file.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the local file path
 */
var localCopy = function(container, entry) {
  var localPath = files.chpath('tmp', 's3', container);
  logger.debug('Copy S3 object to local disk: %s/%s', container, entry);
  return files.chmkdir(localPath)
  .then(function() {
    return stream(container, entry);
  })
  .then(function(res) {
    var localFile = fs.createWriteStream(files.chpath(localPath, entry)),
        result = when.defer();
    res.pipe(localFile);
    res.on('end', function() {
      result.resolve(files.chpath(localPath, entry));
    });
    localFile.on('error', result.reject);
    return result.promise;
  });
};

/**
 * Remove a local copy of the file.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the local file path
 */
var localRemove = function(container, entry) {
  logger.debug('Remove local copy of S3 object: %s/%s', container, entry);
  var localPath = files.chpath('tmp', 's3', container, entry);
  return files.chrm(localPath);
};


/**
 * S3 storage driver.
 * @module s3
 */
module.exports = {
  info: info,
  stream: stream,
  store: store,
  move: move,
  remove: remove,
  getContainerName: getContainerName,
  cleanContainer: cleanContainer,
  localCopy: localCopy,
  localRemove: localRemove
};

