'use strict';

angular.module('DocumentsModule', ['ngRoute'])
.directive('appDocuments', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/documents.html',
    controller: 'DocumentsCtrl'
  };
})
.controller('DocumentsCtrl', function ($rootScope, $scope, $routeParams, $categoryService, $documentService) {
  var m, size = 20;
  $scope.emptyMessage = 'No documents found.';
  $scope.search = false;
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
      $scope.search = true;
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

  $scope.showNewDocument = function() {
    $scope.editing = true;
    $scope.doc = {
      title: 'My new document',
      content: '<p>what\'s up ?</p>',
      contentType:'text/html',
      categories: $scope.category ? [$scope.category.key] : []
    };
  };

  $scope.showDocument = function(id) {
    $scope.editing = false;
    $documentService.get(id)
    .then(function(doc) {
      $scope.doc = doc;
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

  $scope.fetch();
});
