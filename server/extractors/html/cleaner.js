var logger    = require('../../helpers').logger,
    blacklist = require('../../helpers').blacklist,
    url       = require('url');

var blacklistedAttributes = [
  'class', 'id'
];

/**
 * Remove node with blacklisted source.
 * @param {Object} node DOM node
 * @return {Object} DOM node
 */
var filterBlacklistedSites = function(node) {
  if (!node) return null;
  var src = node.getAttribute('src') || node.getAttribute('href');
  if (src && blacklist.contains(src)) {
    logger.debug('Removing blacklisted source: %s', src);
    node.parentNode.removeChild(node);
    // Break the chain.
    return null;
  } else {
    // Continue filter chain
    return node;
  }
};

/**
 * Remove blacklisted attributes.
 * @param {Object} node DOM node
 * @return {Object} DOM node
 */
var filterAttributes = function(node) {
  if (!node) return null;
  for (var i = 0; i < blacklistedAttributes.length; i++) {
    var attr = blacklistedAttributes[i];
    if (node.hasAttribute(attr)) {
      //logger.debug('Removing blacklisted attribute: %s', attr);
      node.removeAttribute(attr);
    }
  }
  return node;
};

/**
 * Filter images src.
 * - Change src attribute into 'app-src' attribute.
 * - Remove 1px images.
 * - Fix relative URL into absolute.
 * @param {Object} document DOM
 */
var filterImages = function(document, options) {
  var images = document.getElementsByTagName('img');
  for (var i = 0; i < images.length; ++i) {
    var image = images[i];
    if (image.hasAttribute('app-src')) {
      image.removeAttribute('src');
    } else {
      // Remove 1px images
      if (image.hasAttribute('height') || image.hasAttribute('width')) {
        var height = image.getAttribute('height'),
            width  = image.getAttribute('width');
        if (height == 1 && width == 1) {
          logger.debug('Removeing 1px image: %s', image.getAttribute('src'));
          image.parentNode.removeChild(image);
          break;
        }
      }
      var src = image.getAttribute('src');
      if (src) {
        // Create absolute URL if possible
        if (options && options.baseUrl && !/^https?|file|ftps?/i.test(src)) {
          src = url.resolve(options.baseUrl, src);
        }
        // Swapping src and app-src attributes.
        image.removeAttribute('src');
        image.setAttribute('app-src', src);
      }
    }
  }
};

/**
 * HTML cleaner.
 * @module cleaner
 */
module.exports = {
  /**
   * HTML cleanup chain.
   * @param {Object} document DOM
   * @param {Object} options options
   * @return {String} cleaned HTML
   */
  cleanup: function(document, options) {
    // Filter all nodes...
    var nodes = document.getElementsByTagName('*');
    for (var i = 0; i < nodes.length; ++i) {
      var node = nodes[i];
      if (filterBlacklistedSites(node)) {
        filterAttributes(node);
      }
    }
    // Filter images...
    filterImages(document, options);
    // Return content.
    return document.body.innerHTML;
  },

  /**
   * Retrieve main illustration.
   * @param {Object} document DOM
   * @return {String} illustration URL
   */
  getIllustration: function(document) {
    var images = document.getElementsByTagName('img');
    return (images && images.length > 0 && images[0].hasAttribute('app-src')) ?
      images[0].getAttribute('app-src') : null;
  }
};
