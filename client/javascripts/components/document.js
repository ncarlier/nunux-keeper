'use strict';

angular.module('DocumentModule', ['ngRoute', 'ngSanitize'])
.directive('appDocument', ['$location', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/document.html',
    controller: 'DocumentCtrl'
  };
}])
.directive('appCategoryTag', [
  '$categoryService', '$filter',
  function($categoryService, $filter) {
    function link(scope, element, attrs) {
      var category;

      scope.$watch(attrs.appCategoryTag, function(value) {
        scope.key = value;
        category = $categoryService.get(scope.key);
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
  }
])
.directive('contenteditable', ['$compile', function($compile) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      // view -> model
      elm.bind('blur', function() {
        scope.$apply(function() {
          ctrl.$setViewValue($('> div', elm).html());
        });
      });

      // model -> view
      ctrl.$render = function() {
        var $content = $('<div>').html(ctrl.$viewValue);
        $content = $compile($content)(scope);
        elm.html($content);
      };

      ctrl.$render();
    }
  };
}])
.controller('DocumentCtrl', [
  '$scope', '$categoryService', '$documentService',
  function ($scope, $categoryService, $documentService) {
    $categoryService.getAll().then(function(categories) {
      $scope.categories = categories;
    });

    $scope.addCategory = function(key) {
      if (!_.contains($scope.doc.categories, key)) {
        $scope.doc.categories.push(key);
      }
    };

    $scope.removeCategory = function(key) {
      if (_.contains($scope.doc.categories, key)) {
        _.remove($scope.doc.categories, function(k) { return k == key; });
      }
    };

    $scope.cancelDocument = function() {
      $scope.editing = false;
      if (!$scope.doc._id) {
        $scope.closeDocument();
      }
    };

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
  }
]);
