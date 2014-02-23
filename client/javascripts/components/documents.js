'use strict';

angular.module('DocumentsModule', ['ngRoute', 'angularFileUpload'])
.directive('appDocuments', ['$location', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/documents.html',
    controller: 'DocumentsCtrl'
  };
}])
.controller('DocumentsCtrl', [
  '$rootScope', '$scope', '$routeParams', '$categoryService',
  '$documentService', '$modal', '$log', '$timeout',
  function ($rootScope, $scope, $routeParams, $categoryService,
            $documentService, $modal, $log, $timeout) {
    var m, size = 20;
    $scope.emptyMessage = 'No documents found.';
    $scope.isSearch = false;
    switch (true) {
      case !$routeParams.q:
        $scope.title = 'All';
      break;
      case '_missing_:category' === $routeParams.q:
        $scope.title = 'Uncategorized';
      break;
      case (m = $routeParams.q.match(/^category:([a-z\-]+)$/)) != null:
        $scope.category = $categoryService.get(m[1]);
      if ($scope.category) {
        $scope.trash = $scope.category.key === 'system-trash';
        if ($scope.trash) {
          $scope.emptyMessage = 'Trash bin is empty.';
        }
      }
      break;
      default:
        $scope.title = 'Search';
      $scope.isSearch = true;
    };

    $scope.documents = [];
    $scope.from = 0;
    $scope.isnext = false;
    $scope.fetch = function() {
      $documentService.fetch($routeParams.q, $scope.from, size)
      .then(function(data) {
        if (data.hits.length == size && $scope.from + size < data.total) {
          $scope.from += size;
          $scope.isnext = true;
        } else {
          $scope.isnext = false;
        }

        _.each(data.hits, function(doc) {
          if (/^image\//.test(doc.fields.contentType)) {
            doc.fields.illustration = '/api/document/' + doc._id +
              '/resource/' + doc.fields.attachment;
          }
          $scope.documents.push(doc);
        });

        $rootScope.$broadcast('app.event.hits', {
          query: $routeParams.q,
          total: data.total
        });
      });
    };

    $scope.next = function() {
      $scope.fetch();
    };

    $scope.trashDocuments = function() {
      if (confirm('Are you sure you want to remove the items in the Trash permanently?')) {
        $documentService.trash()
        .then(function() {
          $scope.doc = null;
          $scope.documents = [];
        });
      }
    };

    $scope.openDocument = function(id) {
      _.each($scope.documents, function(doc) {
        doc.clazz = doc._id == id ? 'active' : '';
      });
      $scope.editing = false;
      $documentService.get(id)
      .then(function(doc) {
        $scope.doc = doc;
        $timeout(function() {
          $scope.doc.opened = true;
        }, 300);
      });
    };

    $scope.closeDocument = function() {
      delete $scope.doc;
    };

    $scope.showDocumentCreationDialog = function() {
      var modalInstance = $modal.open({
        templateUrl: 'templates/dialog/document/create.html',
        controller: 'DocumentCreationModalCtrl',
        resolve: {
          category: function () {
            return $scope.category;
          }
        }
      });

      modalInstance.result.then(function(doc) {
        if (doc._id == null) {
          $scope.editing = true;
          $scope.doc = doc;
        } else {
          $scope.documents.unshift({
            _id: doc._id,
            fields: doc
          });
        }
        $timeout(function() {
          $scope.doc.opened = true;
        }, 300);
      }, function (reason) {
        $log.info('Document creation modal dismissed: ' + reason);
      });
    };

    $scope.removeDocument = function() {
      _.remove($scope.documents, function(doc) { return $scope.doc._id === doc._id; });
      delete $scope.doc;
    };

    $scope.addDocument = function(doc) {
      $scope.documents.push({
        _id: doc._id,
        fields: doc
      });
    };

    $scope.getDraggableData = function(doc) {
      var data = {
        _id: doc._id,
        categories: doc.fields.category
      };
      return JSON.stringify(data);
    };

    $scope.fetch();
  }
])
.controller('DocumentCreationModalCtrl', [
  '$log', '$scope', '$modalInstance', '$upload', '$documentService', 'category',
  function ($log, $scope, $modalInstance, $upload, $documentService, category) {
    $scope.category = category;
    var doc = {
      categories: $scope.category ? [$scope.category.key] : []
    };

    $scope.onFileSelect = function($files) {
      $scope.files = $files;
    };

    var errHandler = function(err) {
      alert('Error: ' + err);
      $modalInstance.dismiss('Error: ' + err);
    };

    $scope.postSimple = function() {
      doc.title = 'My new document';
      doc.content = '<p>what\'s up ?</p>';
      doc.contentType = 'text/html';
      $modalInstance.close(doc);
    };

    $scope.postUrl = function() {
      if (!this.urlForm.$valid) return;
      doc.content = this.url;
      doc.contentType = 'text/vnd.curl';
      $documentService.create(doc)
      .then($modalInstance.close, errHandler);
    };

    $scope.postFile = function() {
      if (!this.fileForm.$valid || !$scope.files) return;
      doc.file = $scope.files[0];
      doc.contentType = 'multipart/form-data';
      $documentService.create(doc)
      .then($modalInstance.close, errHandler);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
