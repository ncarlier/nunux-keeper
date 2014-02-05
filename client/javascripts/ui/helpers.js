'use strict';

angular.module('ui.helpers', ['angular-md5'])
.directive('appSrc', function(md5) {

  var link = function($scope, $element, $attributes) {
    if (!$scope.doc || !$scope.doc._id) return;
    var resourcePath = '/api/document/' + $scope.doc._id + '/resource/';
    $attributes.$observe(
      'appSrc',
      function(newSource) {
        var ext = newSource.split('.').pop();
        $element[0].src = resourcePath + md5.createHash(newSource) + (ext ? '.' + ext : '');
      }
    );
  };

  return {
    restrict: 'A',
    link: link
  };
});
