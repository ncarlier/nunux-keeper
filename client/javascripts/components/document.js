/* global angular, $ ,_, confirm, alert */

'use strict';

angular.module('DocumentModule', ['ngRoute', 'ngSanitize', 'ngCkeditor'])
.directive('appDocument', ['$location', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/document.html',
    controller: 'DocumentCtrl'
  };
}])
.directive('appCategoryTag', [
  'categoryService', '$filter',
  function(categoryService, $filter) {
    function link(scope, element, attrs) {
      var category;

      scope.$watch(attrs.appCategoryTag, function(value) {
        scope.key = value;
        category = categoryService.get(scope.key);
        if (category) {
          scope.label = category.label;
          element.css('background-color', category.color);
          element.css('border-color', $filter('lighten')(category.color, 20));
        }
      });
    }
    return {
      restrict: 'A',
      template: '{{label}}<span class="fa fa-times-circle" ng-click="removeCategory(key)" title="Remove category">',
      link: link
    };
  }
])
.controller('DocumentCtrl', [
  '$rootScope', '$scope', '$sce', '$modal', '$log',
  'categoryService', 'documentService', '$timeout',
  function ($rootScope, $scope, $sce, $modal, $log,
            categoryService, documentService, $timeout) {
    categoryService.getAll().then(function(categories) {
      $scope.categories = categories;
    });

    $scope.loading = false;
    $scope.editorOptions = {
      language: 'en'
    };

    $scope.getHtmlContent = function(doc) {
      if (/^text\/html/.test(doc.contentType)) {
        return $sce.trustAsHtml(doc.content);
      } else if (/^image\//.test(doc.contentType)) {
        var src = '/api/document/' + doc._id + '/resource/' + doc.attachment;
        var $img = $('<img>');
        $img.attr('src', src);
        return $sce.trustAsHtml($('<div>').append($img).html());
      } else if (/^text\/plain/.test(doc.contentType)) {
        var $pre = $('<pre>');
        $pre.text(doc.content);
        return $sce.trustAsHtml($('<div>').append($pre).html());
      } else {
        return doc.content;
      }
    };

    $scope.isPublic = function(doc) {
      return doc._id && _.contains(doc.categories, 'system-public');
    };

    var refreshHandler = function(doc) {
      $scope.doc = doc;
      $scope.editing = false;
      $scope.loading = false;
      $timeout(function() {
        $scope.doc.opened = true;
      }, 300);
    };
    var errorHandler = function(err) {
      $scope.loading = false;
      alert('Error: '+ err);
    };

    $scope.removeCategory = function(key) {
      if (_.contains($scope.doc.categories, key)) {
        var data = _.pick($scope.doc, '_id', 'categories');
        _.remove(data.categories, function(k) { return k == key; });
        if (!data.categories.length) data.categories = ['empty'];
        documentService.update(data)
        .then(refreshHandler, errorHandler);
      }
    };

    $scope.startEditing = function() {
      $scope.editing = true;
    };

    $scope.cancelDocument = function() {
      $scope.editing = false;
      if (!$scope.doc._id) {
        $scope.closeDocument();
      }
    };

    $scope.saveDocument = function() {
      if ($scope.doc._id) {
        documentService.update($scope.doc)
        .then(refreshHandler, errorHandler);
      } else {
        documentService.create($scope.doc)
        .then(refreshHandler, errorHandler);
      }
    };

    $scope.editTitleDialog = function() {
      var backup = angular.copy($scope.doc);
      var modalInstance = $modal.open({
        templateUrl: 'templates/dialog/document/edit-title.html',
        controller: 'DocumentTitleEditionModalCtrl',
        resolve: {
          doc: function () {
            return $scope.doc;
          }
        }
      });

      modalInstance.result.then(null, function(reason) {
        $scope.doc = backup;
        $log.info('Document title edition modal dismissed: ' + reason);
      });
    };

    $scope.reFetchFromSource = function() {
      if (confirm('Are you sure to create a new document from the source of this one ?')) {
        var doc = {
          title: $scope.doc.title,
          content: $scope.doc.link,
          contentType: 'text/vnd.curl'
        };
        $scope.loading = true;
        documentService.create(doc)
        .then(refreshHandler, errorHandler);
      }
    };
  }
])
.controller('DocumentTitleEditionModalCtrl', [
  '$scope', '$modalInstance', 'documentService', 'doc',
  function ($scope, $modalInstance, documentService, doc) {
    $scope.doc = doc;
    var errHandler = function(err) {
      alert('Error: ' + err);
      $modalInstance.dismiss('Error: ' + err);
    };

    $scope.ok = function () {
      if ($scope.doc._id) {
        var data = _.pick($scope.doc, '_id', 'title');
        documentService.update(data)
        .then($modalInstance.close, errHandler);
      } else {
        $modalInstance.close($scope.doc);
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
