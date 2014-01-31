'use strict';

angular.module('DocumentModule', ['ngRoute', 'ngSanitize'])
.directive('appDocument', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/document.html',
    controller: 'DocumentCtrl'
  };
})
.directive('appCategoryTag', function($categoryService, $filter) {
  function link(scope, element, attrs) {
    var category;

    scope.$watch(attrs.appCategoryTag, function(value) {
      scope.key = value;
      category = $categoryService.get(scope.key);
      category.color = category.color ? category.color : '#1F4164';
      scope.label = category.label;
      element.css('background-color', category.color);
      element.css('border-color', $filter('lighten')(category.color, 20));
    });
  }
  return {
    restrict: 'A',
    template: '{{label}}<span class="glyphicon glyphicon-remove-sign" ng-click="removeCategory(key)">',
    link: link
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
.controller('DocumentCtrl', function ($scope, $categoryService, $documentService) {
  $scope.categories = $categoryService.getCategories();

  $scope.addCategory = function(key) {
    if (!_.contains($scope.doc.categories, key)) {
      $scope.doc.categories.push(key);
    }
  }

  $scope.removeCategory = function(key) {
    if (_.contains($scope.doc.categories, key)) {
      _.remove($scope.doc.categories, function(k) { return k == key; });
    }
  }

  $scope.saveDocument = function() {
    if ($scope.doc._id) {
      $documentService.update($scope.doc)
      .then(function(doc) {
        $scope.doc = doc;
        $scope.editing = false;
      });
    } else {
      $documentService.create($scope.doc)
      .then(function(doc) {
        $scope.doc = doc;
        $scope.addDocument(doc);
        $scope.editing = false;
      });
    }
  };

  $scope.deleteDocument = function() {
    if (confirm("Delete this document? " + $scope.doc.title)) {
      $documentService.delete($scope.doc)
      .then(function(doc) {
        $scope.editing = false;
        $scope.removeDocument(doc);
      });
    }
  };
});
