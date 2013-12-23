var extractors = {
  '*/*': require('./default'),
  'text/html': require('./html')
};

module.exports = {
  DocumentExtractor: {
    get: function(contentType) {
      // Return proper extractor or default one.
      return extractors[contentType] ? extractors[contentType] : extractors['*/*'];
    }
  }
};
