/* global angular, alert */

angular.module('ProfileModule', [])
.directive('appProfile', ['$location', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/profile.html',
    controller: 'ProfileCtrl'
  };
}])
.controller('ProfileCtrl', [
  '$scope', '$location', '$routeParams', '$modal', 'userService',
  function ($scope, $location, $routeParams, $modal, userService) {
    'use strict';
    if ($routeParams.error) {
      $scope.message = {clazz: 'alert-danger', text: $routeParams.error};
    } else if ($routeParams.info) {
      $scope.message = {clazz: 'alert-success', text: $routeParams.info};
    }

    userService.get().then(function(user) {
      $scope.user = user;
      userService.getLinkedApp($scope.user).then(function(apps) {
        $scope.apps = apps;
      });
    });
    $scope.realm = $location.protocol() + '://' + $location.host() + ($location.port() === 80 ? '' : ':' + $location.port());

    $scope.revokeClient = function(app) {
      userService.revokeLinkedApp($scope.user, app).then(function() {
        $scope.message = {clazz: 'alert-success', text: 'App ' + app.name + ' access revoked.'};
        userService.getLinkedApp($scope.user).then(function(apps) {
          $scope.apps = apps;
        });
      }, function(err) {
        $scope.message = {clazz: 'alert-danger', text: err};
      });
    };

    $scope.editUserDialog = function() {
      var backup = angular.copy($scope.user);
      var modalInstance = $modal.open({
        templateUrl: 'templates/dialog/user/edit.html',
        controller: 'UserEditionModalCtrl'
      });

      modalInstance.result.then(null, function(reason) {
        $scope.user = backup;
        $log.info('User edition modal dismissed: ', reason);
      });
    };
  }
])
.controller('UserEditionModalCtrl', [
  '$scope', '$modalInstance', 'userService',
  function ($scope, $modalInstance, userService) {
    var errHandler = function(err) {
      alert('Unable to edit user: ' + err.error);
      $modalInstance.dismiss(err);
    };

    $scope.ok = function () {
      userService.update($scope.user)
      .then($modalInstance.close, errHandler);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);

