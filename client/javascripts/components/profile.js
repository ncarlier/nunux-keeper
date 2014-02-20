'use strict';

angular.module('ProfileModule', ['angular-md5'])
.directive('appProfile', ['$location', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/profile.html',
    controller: 'ProfileCtrl'
  };
}])
.controller('ProfileCtrl', [
  '$scope', '$window', '$location', 'md5',
  function ($scope, $window, $location, md5) {
    $scope.user = $window.user;
    $scope.gravatarUrl = 'http://www.gravatar.com/avatar/' + md5.createHash($scope.user.uid.toLowerCase());
    $scope.realm = $location.protocol() + '://' + $location.host() + ($location.port() === 80 ? '' : ':' + $location.port());
  }
]);
