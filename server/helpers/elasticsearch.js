var when = require('when'),
    request = require('request');

var url = process.env.APP_ELASTICSEARCH_URL || 'http://localhost:9200';

/**
 * ElasticSearch helper.
 */
module.exports = {
  search: function(index, q) {
    var result = when.defer();
    request.get({
      url: url + '/' + index + '/_search',
      qs: {q: q},
      json: true
    }, function (err, res, data) {
      if (err) return result.reject(err);
      result.resolve(data);
    });
    return result.promise;
  }
};

