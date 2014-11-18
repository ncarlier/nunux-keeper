var _      = require('underscore'),
    when   = require('when'),
    path   = require('path'),
    files  = require('../../helpers').files,
    logger = require('../../helpers').logger;

/**
 * Get resource stream.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the resource stream
 */
var stream = function(container, entry) {
  var p = files.chpath(container, entry);
  return files.chstream(p);
};

/**
 * Get resource infos.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the resource infos
 */
var info = function(container, entry) {
  var p = files.chpath(container, entry);
  return files.chexists(p)
  .then(function(exists) {
    if (!exists) return when.resolve(null);
    return files.chstat(p)
    .then(function(stats) {
      var infos = {
        driver: 'local',
        size: stats.size,
        path: p,
        container: container,
        key: entry
      };
      return when.resolve(infos);
    });
  });
};

/**
 * Store resource into a container.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @param {String} s Resource stream
 * @return {Promise} Promise of the action
 */
var store = function(container, entry, s) {
  return files.chmkdir(container)
  .then(function() {
    var p = files.chpath(container, entry);
    return files.chwrite(s, p);
  });
};

/**
 * Move resource from a container to another.
 * @param {String} containerSource Container source name
 * @param {String} entry Resource name
 * @param {String} containerDest Container dest name
 * @return {Promise} Promise of the action
 */
var move = function(containerSource, entry, containerDest) {
  return files.chmkdir(containerDest)
  .then(function() {
    var src  = files.chpath(containerSource, entry);
    return files.chmv(src, containerDest);
  });
};

/**
 * Remove resource.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the action
 */
var remove = function(container, entry) {
  var p = entry ? files.chpath(container, entry) : container;
  return files.chrm(p);
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
var listContainer = function(container) {
  return files.chls(container);
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
  return listContainer(container)
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
 * It's a NOOP for this driver because the file is already local.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the local file path
 */
var localCopy = function(container, entry) {
  return when.resolve(files.chpath(container, entry));
};

/**
 * Remove a local copy of the file.
 * It's a NOOP for this driver because the file is already local.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the local file path
 */
var localRemove = function(container, entry) {
  return when.resolve(files.chpath(container, entry));
};

/**
 * Local file system storage driver.
 * @module local
 */
module.exports = {
  info: info,
  stream: stream,
  store: store,
  move: move,
  remove: remove,
  getContainerName: getContainerName,
  listContainer: listContainer,
  cleanContainer: cleanContainer,
  localCopy: localCopy,
  localRemove: localRemove
};

