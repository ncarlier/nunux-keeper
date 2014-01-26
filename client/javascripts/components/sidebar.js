'use strict';

angular.module('SidebarModule', [])
.directive('appSidebar', function($location) {
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
            pattern = href.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
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
})
.controller('SidebarCtrl', function ($window, $scope, $categoryService, $location, $dialog, $timeout) {
  $scope.user = $window.user;
  $scope.gravatarUrl = 'http://www.gravatar.com/avatar/' + $window.gravatar;
  $categoryService.fetch().then(function(categories) {
    $scope.categories = categories;
  });;

  // Key bindings...
  Mousetrap.bind(['g h'], function() {
    $scope.$apply(function() {
      $location.url('/');
    });
  });
  Mousetrap.bind(['g p'], function() {
    $scope.$apply(function() {
      $location.url('/profile');
    });
  });
  Mousetrap.bind(['g a'], function() {
    $scope.$apply(function() {
      $location.url('/documents');
    });
  });
  Mousetrap.bind(['g u'], function() {
    $scope.$apply(function() {
      $location.url('/documents?category=none');
    });
  });
  Mousetrap.bind(['?'], function() {
    $scope.$apply(function() {
      $dialog('templates/dialog/keybindings.html', {
        id: 'keyBindingsDialog',
        title: 'Keyboard shortcuts',
        backdrop: true,
        footerTemplate: '<button class="btn btn-primary" ng-click="$modalSuccess()">{{$modalSuccessLabel}}</button>',
        success: {label: 'ok', fn: function() {}}
      });
    });
  });

  $scope.createCategoryDialog = function() {
    $scope.category = {};
    $dialog('templates/dialog/category/edit.html', {
      id: 'createCategoryDialog',
      title: 'Create new category',
      backdrop: true,
      scope: $scope,
      footerTemplate:
        '<button class="btn" ng-click="$modalCancel()">{{$modalCancelLabel}}</button>' +
        '<button class="btn btn-primary" ng-click="$modalSuccess()">{{$modalSuccessLabel}}</button>',
      success: {label: 'create', fn: function() {
        $categoryService.create($scope.category);
      }}
    });
  };

  $scope.editCategoryDialog = function(category) {
    var backup = angular.copy(category);
    $scope.category = category;
    $dialog('templates/dialog/category/edit.html', {
      id: 'editCategoryDialog',
      title: 'Edit category: ' + category.label,
      backdrop: true,
      scope: $scope,
      footerTemplate:
        '<button class="btn btn-danger pull-left" ng-click="$modalDelete()">{{$modalDeleteLabel}}</button>' +
        '<button class="btn" ng-click="$modalCancel()">{{$modalCancelLabel}}</button>' +
        '<button class="btn btn-primary" ng-click="$modalSuccess()">{{$modalSuccessLabel}}</button>',
      success: {label: 'update', fn: function() {
        $categoryService.update($scope.category)
        .catch(function() {
          category.label = backup.label;
          category.color = backup.color;
        });
      }},
      cancel: {label: 'cancel', fn: function() {
        category.label = backup.label;
        category.color = backup.color;
      }},
      delete: {label: 'delete', fn: function() {
        $categoryService.delete($scope.category);
      }}
    });
  };

  $scope.isUserCategory = $categoryService.isUserCategory;
});
