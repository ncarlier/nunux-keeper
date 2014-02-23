'use strict';

angular.module('DocumentService', ['angularFileUpload'])
.factory('$documentService', [
  '$q', '$http', '$upload', '$log',
  function ($q, $http, $upload, $log) {
    var url = '/api/document';

    var fetchDocuments = function(query, from, size) {
      var params = $.param({
        q: query,
        from: from,
        size: size
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
      if (doc.file) {
        $upload.upload({
          url: url,
          params: {title: doc.title, categories: doc.categories},
          file: doc.file,
        }).progress(function(evt) {
          $log.info('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(data, status, headers, config) {
          deferred.resolve(data);
        }).error(function(err) {
          alert('Unable to create document!');
          deferred.reject(err);
        });
      } else {
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
      }
      return deferred.promise;
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
  }
]);
