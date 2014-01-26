'use strict';

angular.module('NavbarModule', [])
.directive('appNavbar', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/navbar.html',
    controller: 'NavbarCtrl'
  };
})
.controller('NavbarCtrl', function ($scope, $categoryService, $location, $dialog, $timeout) {
  $scope.sample = 'sample';
});
