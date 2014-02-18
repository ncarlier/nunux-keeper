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
  '$scope', '$window', 'md5',
  function ($scope, $window, md5) {
    $scope.user = $window.user;
    $scope.gravatarUrl = 'http://www.gravatar.com/avatar/' + md5.createHash($scope.user.uid.toLowerCase());
  }
]);
