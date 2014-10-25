
angular.module('DocumentService', ['angularFileUpload', 'angular-md5'])
.factory('documentService', [
  '$rootScope', '$q', '$http', '$upload', '$log', 'md5',
  function ($rootScope, $q, $http, $upload, $log, md5) {
    'use strict';
    var url = '/api/document';

    var _processContent = function(doc) {
      if (/^text\/html/.test(doc.contentType)) {
        var resourcePath = '/api/document/' + doc._id + '/resource/';
        var $content = $('<div>').html(doc.content);
        $('img', $content).each(function() {
          var src = $(this).attr('app-src');
          if (src) {
            var cleanSrc = src.replace(/\?.*$/, '');
            var ext = cleanSrc.split('.').pop();
            if (ext) ext = ext.match(/^[a-zA-Z0-9]+/)[0];
            $(this).attr(
              'src',
              resourcePath + md5.createHash(cleanSrc) + (ext ? '.' + ext : '')
            );
          }
        });
        doc.content = $content.html();
      }
    };

    var fetchDocuments = function(query, from, size, order) {
      var params = $.param({
        q: query,
        from: from,
        size: size,
        order: order
      });
      var deferred = $q.defer();
      $http.get(url + '?' + params)
      .success(function(data) {
        deferred.resolve(data.hits);
      })
      .error(deferred.reject);

      return deferred.promise;
    };

    var getDocument = function(id) {
      var deferred = $q.defer();
      $http.get(url + '/' + id)
      .success(function (data) {
        _processContent(data);
        deferred.resolve(data);
      })
      .error(deferred.reject);
      return deferred.promise;
    };

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
          $log.info('Document created: ' + data);
          deferred.resolve(data);
          $rootScope.$broadcast('document-created', { doc: data });
        }).error(function(err) {
          $log.error('Unable to create document: ', err);
          deferred.reject(err);
        });
      } else {
        $http.post(url, doc.content, {
          params: {title: doc.title, categories: doc.categories, link: doc.link},
          headers: {
            'Content-Type': doc.contentType
          }
        })
        .success(function(data) {
          _processContent(data);
          $log.info('Document created:', data);
          deferred.resolve(data);
          $rootScope.$broadcast('document-created', { doc: data });
        })
        .error(function(err) {
          $log.error('Unable to create document: ', err);
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
          'Content-Type': doc.contentType
        }
      })
      .success(function(data) {
        _processContent(data);
        $log.info('Document updated:', data);
        deferred.resolve(data);
        $rootScope.$broadcast('document-updated', { doc: data });
      })
      .error(function(err) {
        $log.error('Unable to update document:', err);
        deferred.reject(err);
      });
      return deferred.promise;
    };

    var trashDocuments = function() {
      var deferred = $q.defer();
      $http.delete(url)
      .success(function() {
        $log.info('Trash emptied.');
        deferred.resolve();
      })
      .error(function(err) {
        $log.error('Unable to empty tashbin:', err);
        deferred.reject(err);
      });
      return deferred.promise;
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
