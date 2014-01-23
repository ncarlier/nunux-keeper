'use strict';

angular.module('DocumentsModule', ['ngRoute', 'akoenig.deckgrid'])
.controller('DocumentsCtrl', function ($scope, $rootScope, $routeParams, $http) {
  $rootScope.currentPage = $routeParams.category;
  $scope.category = {
    key: $routeParams.category,
    label: $routeParams.category
  };
  $scope.title = 'titre: ' + $routeParams.category;

  $scope.url = '/api/document';

  $scope.refresh = function() {
    $scope.documents = [];
    $scope.fetch();
  };

  $scope.fetch = function() {
    if ($scope.busy) return;
    console.log('Fetching documents...');
    $scope.busy = true;
    var params = $.param({
      //q: 'category:' + $scope.category.key
    });
    var url = $scope.url + '?' + params;
    $http.get(url).success(function(data) {
      $scope.documents = data.hits.hits;
      $scope.documents.push({
        fields: {
          title: "Test document"
        }
      });
      $scope.busy = false;
    });
  };

  $scope.refresh();
});
