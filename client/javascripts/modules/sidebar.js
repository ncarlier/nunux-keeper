'use strict';

angular.module('SidebarModule', [])
.controller('SidebarCtrl', function ($scope, $rootScope, $http, $location, $dialog) {
  $scope.refresh = function() {
    $http.get('/api/category').success(function (data) {
      $scope.categories = data;
    });
  };

  $scope.$on('app.event.category.edit', $scope.refresh);
  $scope.$on('app.event.category.remove', $scope.refresh);

  // Key bindings...
  Mousetrap.bind(['g h'], function() {
    $scope.$apply(function() {
      $location.url('/');
    });
  });
  Mousetrap.bind(['g p'], function() {
    $scope.$apply(function() {
      $location.url('/profile');
    });
  });
  Mousetrap.bind(['g a'], function() {
    $scope.$apply(function() {
      $location.url('/documents');
    });
  });
  Mousetrap.bind(['g u'], function() {
    $scope.$apply(function() {
      $location.url('/documents?category=none');
    });
  });
  Mousetrap.bind(['?'], function() {
    $scope.$apply(function() {
      $dialog('/views/keybindings.html', {
        id: 'keyBindingsDialog',
        title: 'Keyboard shortcuts',
        backdrop: true,
        footerTemplate: '<button class="btn btn-primary" ng-click="$modalSuccess()">{{$modalSuccessLabel}}</button>',
        success: {label: 'ok', fn: function() {}}
      });
    });
  });

  $scope.setupCategory = function(category) {
    alert(category.key);
    return false;
  };

  $scope.refresh();
});
