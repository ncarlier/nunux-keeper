'use strict';

angular.module('DocumentsModule', ['ngRoute', 'akoenig.deckgrid'])
.directive('appDocuments', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/documents.html',
    controller: 'DocumentsCtrl'
  };
})
.controller('DocumentsCtrl', function ($rootScope, $scope, $routeParams, $categoryService, $documentService) {
  var m, search = false;
  $scope.emptyMessage = 'No documents found.';
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
      search = true;
  }

  $scope.fetch = function() {
    $scope.documents = [];
    $documentService.fetch($routeParams.q)
    .then(function(data) {
      _.each(data.hits, function(doc) {
        doc.icon = 'glyphicon-file';
        $scope.documents.push(doc);
      });
      if ($scope.trash && $scope.documents.length) {
        // Add creation card...
        $scope.documents.unshift({
          icon: 'glyphicon-trash',
          fields: {
            title: 'Empty trash bin!'
          }
        });
      } else if (!$scope.trash && !search) {
        // Add creation card...
        $scope.documents.unshift({
          icon: 'glyphicon-plus',
          fields: {
            title: 'Create new document...'
          }
        });
      }

      $rootScope.$broadcast('app.event.hits', {
        query: $routeParams.q,
        total: data.total
      });
    });
  };

  $scope.clickOnCard = function(card) {
    var type = card.icon.split('-').pop();
    switch (true) {
      case type === 'trash':
        return $scope.trashDocuments();
      case type === 'plus':
        return $scope.showNewDocuments();
      default:
        return $scope.showDocument(card._id);
    }
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

  $scope.showNewDocuments = function() {
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
