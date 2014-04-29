/* global angular, alert */

'use strict';

angular.module('ProfileModule', [])
.directive('appProfile', ['$location', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/profile.html',
    controller: 'ProfileCtrl'
  };
}])
.controller('ProfileCtrl', [
  '$scope', '$window', '$location', '$userService',
  function ($scope, $window, $location, $userService) {
    $scope.user = $window.user;
    $scope.realm = $location.protocol() + '://' + $location.host() + ($location.port() === 80 ? '' : ':' + $location.port());

    $userService.getLinkedApp($scope.user).then(function(apps) {
      $scope.apps = apps;
    });
  }
]);

