'use strict';

angular.module('ProfileModule', [])
.controller('ProfileCtrl', function ($scope, $window) {
  $scope.user = $window.user;
  $scope.gravatarUrl = 'http://www.gravatar.com/avatar/' + $window.gravatar;
});
