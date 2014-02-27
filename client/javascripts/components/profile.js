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
  '$scope', '$window', '$location', '$modal', '$log',
  function ($scope, $window, $location, $modal, $log) {
    $scope.user = $window.user;
    $scope.realm = $location.protocol() + '://' + $location.host() + ($location.port() === 80 ? '' : ':' + $location.port());

    $scope.editUserDialog = function() {
      var backup = angular.copy($scope.user);
      var modalInstance = $modal.open({
        templateUrl: 'templates/dialog/user/edit.html',
        controller: 'UserEditionModalCtrl'
      });

      modalInstance.result.then(null, function(reason) {
        $scope.user = backup;
        $log.info('User edition modal dismissed: ' + reason);
      });
    };
  }
])
.controller('UserEditionModalCtrl', [
  '$scope', '$modalInstance', '$userService',
  function ($scope, $modalInstance, $userService) {
    var errHandler = function(err) {
      alert('Error: ' + err);
      $modalInstance.dismiss('Error: ' + err);
    };

    $scope.ok = function () {
      $userService.update($scope.user)
      .then($modalInstance.close, errHandler);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
