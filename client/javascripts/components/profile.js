'use strict';

angular.module('ProfileModule', [])
.directive('appProfile', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/profile.html',
    controller: 'ProfileCtrl'
  };
})
.controller('ProfileCtrl', function ($scope, $window) {
  $scope.user = $window.user;
  $scope.gravatarUrl = 'http://www.gravatar.com/avatar/' + $window.gravatar;
});
