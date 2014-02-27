var url = require('url');

var regExp = {
  a:      /<a[^>]+href\s*=\s*['"]([^'"]+)['"]+[^>]*>(?:(?:[^<])|<(?!a))*<\/a>/gi,
  img:    /<img[^>]+src\s*=\s*['"]([^'"]+)['"]+[^>]*>(?:(?:[^<])|<(?!img))*<\/img>/gi,
  iframe: /<iframe[^>]+src\s*=\s*['"]([^'"]+)['"]+[^>]*>(?:(?:[^<])|<(?!iframe))*<\/iframe>/gi,
  appSrc: /<img[^>]+app\-src[^>\/]+\/>/gi,
  imgSrc: /<img([^>]+)src\s*=\s*['"]([^'"]+)['"]/gi,
  css:    /\s+class\s*=\s*['"][^'"]+['"]/gi
};

var blacklist = [
  /^http[s]?:\/\/feeds.feedburner.com/i,
  /^http[s]?:\/\/[^\/]*doubleclick.net/i
];

/**
 * Filter blacklisted sites:
 * - remove <a> or <img> targeting blacklisted sites
 * @param {String} match
 * @param {String} p1
 * @param {String} offset
 * @param {String} string
 * @return {String} filtered string
 */
var filterBlacklistedSites = function(match, p1, offset, string) {
  for (var i = 0; i < blacklist.length; i++) {
    if (blacklist[i].test(p1)) return '';
  }
  return match;
};

/**
 * Filter images data-src attribute:
 * - remove 'src' attribute of images with 'app-src'
 * @param {String} match
 * @param {String} offset
 * @param {String} string
 * @return {String} filtered string
 */
var filterAppImgSrc = function(match, offset, string) {
  return match.replace(/\s+src\s*=\s*['"][^'"]+['"]/, '');
};

/**
 * Filter images src attribute:
 * - Create absolute URL
 * - replace 'src' attribute by 'app-src'
 * @param {String} baseUrl base url used to create absolute path
 * @return {String} filtered string
 */
var filterImgSrc = function(baseUrl) {
  return function(match, p1, p2, offset, string) {
    // Ignore app-src directives
    if (/app\-$/i.test(p1)) return match;
    // Create absolute URL if not
    if (!/^https?|file|ftps?/i.test(p2) && baseUrl) {
      p2 = url.resolve(baseUrl, p2);
    }
    // Replace 'src' attribute by 'app-src'
    return '<img' + p1 + 'app-src="' + p2 + '"';
  };
};

/**
 * Filter content helper.
 * @module filter
 */
module.exports = function(content, url) {
  return content
  .replace(regExp.a, filterBlacklistedSites)
  .replace(regExp.img, filterBlacklistedSites)
  .replace(regExp.iframe, filterBlacklistedSites)
  .replace(regExp.appSrc, filterAppImgSrc)
  .replace(regExp.imgSrc, filterImgSrc(url))
  .replace(regExp.css, '');
};

