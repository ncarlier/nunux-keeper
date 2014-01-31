'use strict';

angular.module('DocumentsModule', ['ngRoute', 'akoenig.deckgrid'])
.directive('appDocuments', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/documents.html',
    controller: 'DocumentsCtrl'
  };
})
.controller('DocumentsCtrl', function ($scope, $routeParams, $categoryService, $documentService) {
  var m, search = false;
  switch (true) {
    case !$routeParams.q:
      $scope.title = 'All';
    break;
    case '_missing_:category' === $routeParams.q:
      $scope.title = 'Uncategorized';
    break;
    case (m = $routeParams.q.match(/^category:([a-z\-]+)$/)) != null:
      $scope.category = $categoryService.get(m[1]);
    break;
    default:
      $scope.title = 'Search';
      search = true;
  }

  $scope.fetch = function() {
    $scope.documents = [];
    $documentService.fetch($routeParams.q)
    .then(function(documents) {
      $scope.documents = documents;
      if (!search) {
        // Add creation card...
        $scope.documents.unshift({
          create: true,
          fields: {
            title: 'Create new document...'
          }
        });
      }
    });
  };

  $scope.showDocument = function(id) {
    $scope.editing = typeof id === "undefined";
    if (!id) {
      $scope.doc = {
        title: 'My new document',
        content: '<p>what\'s up ?</p>',
        contentType:'text/html',
        categories: $scope.category ? [$scope.category.key] : []
      };
    } else {
      $documentService.get(id)
      .then(function(doc) {
        $scope.doc = doc;
      });
    }
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
