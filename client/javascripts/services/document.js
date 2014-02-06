'use strict';

angular.module('DocumentService', [])
.factory('$documentService', ['$q', '$http', function ($q, $http) {
  var url = '/api/document';

  var fetchDocuments = function(query) {
    var params = $.param({
      q: query
    });
    var deferred = $q.defer();
    $http.get(url + '?' + params)
    .success(function(data) {
      deferred.resolve(data.hits);
    })
    .error(deferred.reject);

    return deferred.promise;;
  };

  var getDocument = function(id) {
    var deferred = $q.defer();
    $http.get(url + '/' + id)
    .success(function (data) {
      deferred.resolve(data);
    })
    .error(deferred.reject);
    return deferred.promise;;
  }

  var createDocument = function(doc) {
    var deferred = $q.defer();
    $http.post(url, doc.content, {
      params: {title: doc.title, categories: doc.categories},
      headers: {
        "Content-Type": doc.contentType
      }
    })
    .success(function(data) {
      deferred.resolve(data);
    })
    .error(function(err) {
      alert('Unable to create document!');
      deferred.reject(err);
    });
    return deferred.promise;;
  };

  var updateDocument = function(doc) {
    var deferred = $q.defer();
    $http.put(url + '/' + doc._id, doc.content, {
      params: {title: doc.title, categories: doc.categories},
      headers: {
        "Content-Type": doc.contentType
      }
    })
    .success(function(data) {
      deferred.resolve(data);
    })
    .error(function(err) {
      alert('Unable to update document!');
      deferred.reject(err);
    });
    return deferred.promise;;
  };

  var trashDocuments = function() {
    var deferred = $q.defer();
    $http.delete(url)
    .success(function() {
      deferred.resolve();
    })
    .error(function(err) {
      alert('Unable to trash documents!');
      deferred.reject(err);
    });
    return deferred.promise;;
  };

  return {
    fetch: fetchDocuments,
    get: getDocument,
    create: createDocument,
    update: updateDocument,
    trash: trashDocuments
  };
}]);
