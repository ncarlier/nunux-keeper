'use strict';

angular.module('NavbarModule', [])
.directive('appNavbar', function($location) {
  return {
    restrict: 'E',
    templateUrl: '/views/navbar.html'
  };
})
.controller('NavbarCtrl', function ($scope, $categoryService, $location, $dialog, $timeout) {
  $scope.sample = 'sample';
});
