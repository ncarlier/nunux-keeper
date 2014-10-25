
angular.module('NavbarModule', [])
.directive('appNavbar', ['$location', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/navbar.html',
    controller: 'NavbarCtrl'
  };
}])
.controller('NavbarCtrl', [
  '$scope', '$rootScope', '$location', '$routeParams',
  function ($scope, $rootScope, $location, $routeParams) {
    'use strict';
    if ($routeParams.q) {
      $scope.query = decodeURIComponent($routeParams.q);
    }
    $scope.toggleMenu = function() {
      $rootScope.mainMenuStatus = $rootScope.mainMenuStatus === 'open' ? '' : 'open';
    };

    $scope.search = function(query) {
      $location.url('/document?q=' + encodeURIComponent(query));
    };
  }
]);
