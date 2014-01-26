'use strict';

angular.module('DocumentsModule', ['ngRoute', 'akoenig.deckgrid', 'ngSanitize'])
.directive('appDocuments', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/documents.html',
    controller: 'DocumentsCtrl'
  };
})
.directive('appDocument', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/document.html'
  };
})
.directive('contenteditable', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      // view -> model
      elm.bind('blur', function() {
        scope.$apply(function() {
          ctrl.$setViewValue(elm.html());
        });
      });

      // model -> view
      ctrl.$render = function() {
        elm.html(ctrl.$viewValue);
      };

      ctrl.$render();
    }
  };
})
.controller('DocumentsCtrl', function ($scope, $routeParams, $categoryService, $documentService) {
  switch (true) {
    case !$routeParams.category:
      $scope.title = 'All';
      break;
    case 'none' === $routeParams.category:
      $scope.title = 'Uncategorized';
      break;
    default:
      $scope.category = $categoryService.get($routeParams.category);
      $scope.title = $scope.category.label;
  }

  $scope.fetch = function() {
    $scope.documents = [];
    $documentService.fetch()
    .then(function(documents) {
      $scope.documents = documents;
      // Add creation card...
      $scope.documents.unshift({
        create: true,
        fields: {
          title: 'Create new document...'
        }
      });
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

  $scope.saveDocument = function() {
    if ($scope.doc._id) {
      $documentService.update($scope.doc)
      .then(function(doc) {
        $scope.doc = doc;
        alert("Updated.");
      });
    } else {
      $documentService.create($scope.doc)
      .then(function(doc) {
        $scope.doc = doc;
        alert("Created: " + $scope.doc._id)
      });
    }
  };

  $scope.deleteDocument = function() {
    if (confirm("Delete this document? " + $scope.doc.title)) {
      $documentService.delete($scope.doc)
      .then(function(doc) {
        $scope.doc = null;
        alert("Deleted: " + doc._id);
      });
    }
  };

  $scope.fetch();
});
