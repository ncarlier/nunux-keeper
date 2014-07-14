/* global $, angular, alert, Mousetrap ,_ */

'use strict';

angular.module('SidebarModule', [])
.directive('appSidebar', ['$location', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/sidebar.html',
    controller: 'SidebarCtrl',
    link: function postLink(scope, element, attrs, controller) {
      // Watch for the $location
      scope.$watch(function() {
        return $location.url();
      }, function(newValue, oldValue) {
        var target = newValue.replace(/^\//g, '#');
        $('a.list-group-item', element).each(function(k, a) {
          var $a = angular.element(a),
            href = $a.attr('href'),
            pattern, regexp;

          if (href) {
            pattern = href.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
            regexp = new RegExp('^' + pattern + '$', ['i']);

            if(regexp.test(target)) {
              $a.addClass('active');
            } else {
              $a.removeClass('active');
            }
          }
        });
      });
    }
  };
}])
.controller('SidebarCtrl', [
  '$scope', 'userService', 'categoryService', 'documentService',
  '$modal', '$log', '$location', '$timeout',
  function ($scope, userService, categoryService, documentService,
            $modal, $log, $location, $timeout) {
    userService.get().then(function(user) {
      $scope.user = user;
    });

    var refresh = function() {
      categoryService.getAll()
      .then(function(categories) {
        $scope.categories = categories;
      });
    };

    $scope.$on('app.event.hits', function(event, data) {
      if (!data.query) {
        $scope.total = data.total;
      } else if (data.query === '_missing_:category') {
        $scope.uncatTotal = data.total;
      } else {
        var m = data.query.match(/category:([a-z0-9_-]+)/);
        if (m) {
          var cat = categoryService.get(m[1]);
          if (cat) {
            cat.total = data.total;
          }
        }
      }
    });

    // Key bindings...
    Mousetrap.bind(['g h'], function() {
      $scope.$apply(function() {
        $location.url('/');
      });
    });
    Mousetrap.bind(['g u'], function() {
      $scope.$apply(function() {
        $location.url('/profile');
      });
    });
    Mousetrap.bind(['g p'], function() {
      $scope.$apply(function() {
        $location.url('/document?q=category:system-public');
      });
    });
    Mousetrap.bind(['g t'], function() {
      $scope.$apply(function() {
        $location.url('/document?q=category:system-trash');
      });
    });
    Mousetrap.bind(['g n'], function() {
      $scope.$apply(function() {
        $location.url('/document?q=_missing_:category');
      });
    });
    Mousetrap.bind(['?'], function() {
      $scope.$apply(function() {
        $modal.open({
          templateUrl: 'templates/dialog/keybindings.html',
          controller: 'KeybindingsHelpModalCtrl'
        });
      });
    });

    $scope.createCategoryDialog = function() {
      $scope.category = {};
      var modalInstance = $modal.open({
        templateUrl: 'templates/dialog/category/edit.html',
        controller: 'CategoryEditionModalCtrl'
      });

      modalInstance.result.then(refresh, function(reason) {
        $log.info('Category creation modal dismissed: ' + reason);
      });
    };

    $scope.editCategoryDialog = function(category) {
      var backup = angular.copy(category);
      $scope.category = category;
      var modalInstance = $modal.open({
        templateUrl: 'templates/dialog/category/edit.html',
        controller: 'CategoryEditionModalCtrl'
      });

      modalInstance.result.then(refresh, function(reason) {
        category.label = backup.label;
        category.color = backup.color;
        $log.info('Category edition modal dismissed: ' + reason);
      });
    };

    $scope.handleDropOnCategory = function(id, data) {
      var key = id.split('$').pop();

      data = JSON.parse(data);
      if (!data.document) {
        // Not a document. Exit.
        return;
      }
      var doc = data.document;

      if (!doc.categories) {
        doc.categories = [];
      }
      if (_.isString(doc.categories)) {
        doc.categories = [doc.categories];
      }
      if (!_.contains(doc.categories, key)) {
        doc.categories.push(key);
        var _data = _.pick(doc, '_id', 'categories');
        documentService.update(_data)
        .then(function(doc) {
          var cat = _.findWhere($scope.categories, {key: key});
          cat.eventMsg = '+1';
          cat.event = true;
          $timeout(function() {
            cat.event = false;
          }, 2000);

          $log.info('Category "'+ key +'" added to document: ' + doc._id);
        }, function(err) {
          alert('Error: ' + err);
        });
      } else {
        $log.debug('Category "'+ key +'" already in document. Ignore.');
      }
    };

    refresh();
  }
])
.controller('CategoryEditionModalCtrl', [
  '$scope', '$modalInstance', 'categoryService',
  function ($scope, $modalInstance, categoryService) {
    var errHandler = function(err) {
      alert('Error: ' + err);
      $modalInstance.dismiss('Error: ' + err);
    };

    $scope.colors = [
      '#FE2E2E', '#FE9A2E', '#F7FE2E', '#9AFE2E','#2EFE2E', '#2EFE9A', '#2EFEF7',
      '#2E9AFE', '#2E64FE', '#642EFE', '#CC2EFA', '#FE2EC8', '#A4A4A4'
    ];

    $scope.setColor = function(color) {
      $scope.category.color = color;
    };

    $scope.ok = function () {
      if ($scope.category.key) {
        categoryService.update($scope.category)
        .then($modalInstance.close, errHandler);
      } else {
        categoryService.create($scope.category)
        .then($modalInstance.close, errHandler);
      }
    };

    $scope.delete = function () {
      categoryService.delete($scope.category)
      .then($modalInstance.close, errHandler);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
])
.controller('KeybindingsHelpModalCtrl', [
  '$scope', '$modalInstance',
  function($scope, $modalInstance) {
    $scope.ok = function () {
      $modalInstance.dismiss('ok');
    };
  }
]);
